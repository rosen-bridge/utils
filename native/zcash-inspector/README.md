# Rosen Zcash native transaction inspector

This bounded offline CLI decodes one raw Zcash transaction and emits structural JSON for a
scanner. It accepts transparent, shielded, mixed, coinbase, and multi-input transactions. It does
not sign, calculate signature digests, call a node, resolve prevout values, or decide whether a
transaction is a Rosen deposit.

## Contract

The CLI reads one JSON object from standard input:

```json
{
  "raw_tx_hex": "<canonical-lowercase-transaction-hex>",
  "expected_branch_id": "c2d6d0b4"
}
```

Both fields are required. Positional arrays, scalars, duplicate fields and unknown fields are
rejected. The branch is explicit block context. V1 through V4 transactions do not
embed a branch ID, so the response labels their branch source as `context`. V5 and V6 transactions
embed a branch ID; it must equal `expected_branch_id`, and the response labels it `embedded`.
The transaction version must also be valid in the expected branch according to the pinned
`zcash_primitives` implementation.

Successful output includes:

- the canonical byte-reversed `txid` used by node RPCs and explorers;
- version kind, number, serialized header, and version-group ID;
- consensus branch, branch source, lock time, and expiry height;
- coinbase and fully-transparent classification;
- every transparent input's canonical prevout txid, index, exact scriptSig, and sequence;
- every transparent output's exact integer zatoshi value, scriptPubKey, index, and standard script
  classification;
- Sprout JoinSplit, Sapling spend/output, Orchard action, and Ironwood action counts.

`version.header` is the numeric `u32` header rendered as hexadecimal. For example, V5 is
`80000005`; its first four serialized bytes are `05000080` because the wire encoding is little
endian.

After decoding and confirming complete input consumption, the helper canonically reserializes the
transaction and requires byte-for-byte equality with `raw_tx_hex`. This rejects encodings whose
fields a parser accepts but normalizes or discards instead of exposing, such as a V4 Sapling
valueBalance with zero shielded spends and outputs.

Shielded or coinbase classification is data, not an error. A scanner can reject a shielded deposit
candidate while continuing to inspect the other transactions in the block. Unsupported, missing,
or malformed input cannot authorize checkpoint advancement; block retry and checkpoint policy
belong to the scanner that invokes this helper.

This is canonical decoding, not complete consensus validation. It does not verify scripts, proofs,
coinbase consensus rules, block membership, confirmation status, or network activation state.

## Bounds and typed failures

`raw_tx_hex` is limited to 2,000,000 decoded bytes, which accommodates a transaction up to the
Zcash block serialization limit. The CLI reads at most 4,001,025 bytes and rejects a request above
4,001,024 bytes before JSON parsing. The extra 1,024 bytes cover the JSON field names, branch ID,
and ordinary formatting around a maximum-size canonical hex string.

Canonical raw hex is nonempty, even-length, lowercase, and has no `0x` prefix. Failures are emitted
as JSON on standard error with a stable `code`:

- `missing_raw_transaction`, `raw_transaction_too_large`, `noncanonical_hex`;
- `missing_branch_id`, `invalid_branch_id`, `unsupported_branch_id`, `branch_mismatch`;
- `unsupported_transaction_format`, `truncated_transaction`, `malformed_transaction`,
  `trailing_bytes`, `noncanonical_transaction`;
- `invalid_json`, `input_too_large`, `input_read_failed`.

An unknown version or version-group pair is `unsupported_transaction_format`; a recognized format
whose remaining fields cannot be decoded is `malformed_transaction`. This distinction reports the
pinned parser's capability and does not claim that an unknown future format is consensus-valid.

## Portable use

Build and test with a machine-local Cargo target outside any synchronized source tree:

```powershell
$env:CARGO_TARGET_DIR = '<machine-local-target>'
cargo test --locked --offline
cargo build --locked --offline
Get-Content -Raw examples/inspect.json | cargo run --locked --offline
```

The equivalent stdin and file workflow in a POSIX shell is:

```sh
CARGO_TARGET_DIR='<machine-local-target>' cargo test --locked --offline
CARGO_TARGET_DIR='<machine-local-target>' cargo run --locked --offline < examples/inspect.json
```

The binary accepts stdin only. Redirecting a file and piping JSON use the same bounded reader.

## Exact dependencies and fixture provenance

Direct dependencies are exact pins: `hex 0.4.3`, `serde 1.0.229`, `serde_json 1.0.145`,
`zcash_primitives 0.30.1`, `zcash_protocol 0.10.5`, `zcash_script 0.4.3`, and
`zcash_transparent 0.10.0`. `Cargo.lock` freezes the transitive graph.

Tests contain only public transaction bytes:

- checkpoint 003 final deposit block JSON SHA-256
  `421f8296971cc0e3b0f2ce3d54dc52ad7efc2c5935f9de07ac8dca4c968d4b2f`, covering its
  coinbase and deposit transactions;
- checkpoint 003 final withdrawal block JSON SHA-256
  `7ee2d2cde2cbc33c03ab3487954382709f46910c90f94e6e52a0c99e5994f97c`;
- ZIP-244 vector 7 from `zcash/zcash-test-vectors` commit
  `78321beacb0e0477e33cd002b56585a107c2708c`, whose 660 serialized bytes have SHA-256
  `35cd79a02b9aad29c0d5f5158953fa13c48b05e3036fb4e34632e58bd74fce4c`.

The matrix covers canonical txids, exact output amounts and scripts, coinbase, shielded bundle
counts, transparent V4 branch context, multi-input preservation, strict byte consumption, limits,
and isolated missing, malformed, truncated, unsupported-format, unknown-branch, branch-mismatch,
noncanonical-hex, and parser-normalization failures.
