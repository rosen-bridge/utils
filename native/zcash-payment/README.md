# Bounded Rosen/Zcash native payment primitive

This offline Rust experiment constructs one-input P2PKH version-5 payment candidates, computes their ZIP-244 `SIGHASH_ALL` digest, and can consume an externally produced compact ECDSA signature and compressed public key to form and verify a P2PKH `scriptSig`.

The isolated Orchard extension adds `orchard_prepare`, `orchard_verify`, and `orchard_finalize` for one transparent P2PKH reserve input, one explicitly selected Orchard receiver in a Unified Address, and one P2PKH change output. It fixes the Nu6.2 branch (`5437f330`), two-action Orchard bundle, and 15,000-zat ZIP-317 fee. The explicit `network` value is `regtest_nu6_2_at_two` for a disposable regtest configured with Overwinter through Canopy at height 1, NU5 through NU6.2 at height 2, and NU6.3 inactive. The alternate `testnet_nu6_2` accepts heights 4,052,000 through 4,133,999; this is a historical window and does not represent current Testnet. It does not import the reserve custody key; synthetic keys appear only in the local test and fixture generator.

`orchard_prepare` accepts `{"operation":"orchard_prepare","intent":{...}}`. The `intent` fields are `network`, `expected_branch_id`, `target_height`, `expiry_height`, `input` (same shape as `construct`), `compressed_pubkey_hex`, `recipient_ua`, `payout_zat`, and `change_zat`. Regtest requires an `uregtest1...` UA and target height at least 2; the expiry must be within 40 blocks. It constructs and proves an Orchard PCZT, performs IO finalization, independently verifies the frozen PCZT against the intent, then returns `pczt_hex`, `txid_raw`, `fingerprint_sha256`, `sighash_all`, `actual_fee_zat`, `recipient_ciphertext_verified`, and `orchard_proof_verified`.

`orchard_verify` accepts the same `intent` and `pczt_hex` and returns `txid_raw`, the fingerprint, digest, fee, and verification flags without rebuilding randomized proof or ciphertext. `orchard_finalize` accepts `intent`, `pczt_hex`, the previously agreed `fingerprint_sha256`, and an externally produced 64-byte `compact_signature_hex`; it verifies the frozen proposal again, attaches the transparent signature, finalizes spends, verifies the Orchard proof during extraction, and returns `signed_tx_hex`, `signed_txid_raw`, the fingerprint, digest, and verification flags. It rejects extraction unless the signed transaction ID equals the previously exposed PCZT effects transaction ID. Both transaction ID fields use raw digest byte order; reverse for node/display order. The fingerprint is SHA-256 of the exact serialized pre-signature PCZT and is the proposal artifact to bind across TSS.

`orchard_verify_signed` accepts the same `intent`, `pczt_hex`, `fingerprint_sha256`, and `compact_signature_hex` as finalization, plus the already saved `signed_tx_hex`. It returns `signed_txid_raw`, the fingerprint, digest, and verification flags. The pinned extractor creates Orchard's final binding signature with `OsRng`, so repeated finalization changes the last 64 raw bytes even though the txid is stable. Signed verification independently checks the frozen PCZT and external transparent signature, requires every raw byte outside that final binding signature to equal a freshly extracted transaction, parses and roundtrips the submitted transaction canonically, and validates its actual Orchard proof, spend authorization, and binding signature against the shielded signature hash. This is the signed restore path; comparing the complete raw bytes to a second finalization would reject a valid saved transaction.

The independent PCZT verifier checks exact reserve outpoint/value/script/sequence, transparent change, expiry/branch/version, empty other shielded pools, one value-carrying Orchard payout, the note commitment, sender-side ciphertext recovery using a transaction-random OVK retained as PCZT output metadata, and the Orchard circuit proof. The recovered note's recipient, value, and commitment must match the approved receiver, payout, and action `cmx`. The pinned Orchard builder does not retain the derived OCK in its PCZT output (`ock: None`), so the per-transaction OVK is stored under `rosen:output-ovk` and bound by the PCZT fingerprint. A signer must accept only the digest returned by `orchard_verify` for the fingerprint approved by peers. The operation does not query a node or assert node acceptance.

It never creates a key or signature. `finalize` parses the caller's 64-byte `r || s` signature with `secp256k1`, rejects high-S, serializes canonical DER, appends `SIGHASH_ALL` byte `01`, binds `HASH160(compressed_pubkey)` to the supplied P2PKH prevout, and evaluates the signed input through `zcash_script`'s real callback verifier. A successful result requires exactly one CHECKSIG callback.

## Build and run

Use a Cargo target directory outside any synchronized source tree:

```powershell
$env:CARGO_TARGET_DIR = "$env:LOCALAPPDATA\ergo-runtime\cargo-target\rosen-zcash-native-check"
cargo build --locked --offline
```

Read JSON from standard input:

```powershell
Get-Content -Raw examples\digest.json | cargo run --locked --offline
```

Or read one JSON file:

```powershell
cargo run --locked --offline -- --input examples\finalize-known-fixture.json
```

Errors are JSON on standard error and return a nonzero exit status. Successful results are JSON on standard output.
Standard input and `--input` files are capped at 4,001,024 bytes.

## Request and response contract

`construct` requires:

- `expected_branch_id`: exactly eight lowercase hexadecimal digits naming a known branch.
- Explicit `lock_time` and `expiry_height` unsigned 32-bit integers.
- One `input` containing a display-order lowercase transaction ID, output index, sequence, amount in zatoshis, and exact P2PKH script.
- Between one and 1,024 ordered `outputs`, each containing an amount in zatoshis and exact P2PKH script. The cap is operational, not a consensus limit.

It returns the canonical unsigned v5 bytes plus `txid_raw`, `sighash_all`, `actual_fee_zat`, and `zip317_conventional_fee_zat`. Construction uses the pinned Zcash transaction types and serializer; it does not hand-assemble transaction bytes or infer any field.

`digest` and `finalize` require:

- `unsigned_tx_hex`: one fully consumed version-5 serialization.
- `expected_branch_id`: exactly eight hexadecimal digits, compared with the embedded branch ID.
- `input_amount_zat`: a JSON integer in the `Zatoshis` range.
- `prevout_script_hex`: an exact 25-byte P2PKH script for the sole input.

`digest` returns:

- `txid_raw`: raw transaction-id digest bytes in hexadecimal.
- `sighash_all`: ZIP-244 transparent input digest in hexadecimal.
- `actual_fee_zat`: input amount minus the checked sum of transparent outputs.
- `zip317_conventional_fee_zat`: conventional fee from the pinned native ZIP-317 `FeeRule`, with one standard P2PKH input and the transaction's actual serialized output sizes.

`finalize` additionally requires:

- `compact_signature_hex`: exactly 64 bytes, `r || s`, already produced over the returned digest.
- `compressed_pubkey_hex`: exactly 33 bytes in canonical compressed encoding.

It returns the digest and fee fields plus `unsigned_txid_raw`, `signed_txid_raw`, `der_signature_plus_type_hex`, `script_sig_hex`, `signed_tx_hex`, and `callback_count`.

## Enforced boundary

The request and nested input/output DTOs require JSON objects. Positional arrays,
duplicate keys, unknown keys and missing keys are rejected by the direct decoder;
the nested map-only visitors preserve the original field and number validation.

The constructor rejects unknown fields, non-lowercase identifiers, unknown branches, a null coinbase outpoint, amounts outside `Zatoshis`, empty or oversized output lists, output totals above the input, and non-P2PKH input or output scripts. The shared parser rejects trailing transaction bytes, versions other than v5, shielded bundles, input cardinality other than one, zero outputs, a prefilled input `scriptSig`, a branch mismatch, amounts outside `Zatoshis`, negative fee balance, and prevout scripts other than exact P2PKH. `finalize` also rejects malformed or high-S compact signatures, malformed or uncompressed public keys, a public-key hash that does not match the prevout, and any result rejected by the script engine.

The helper trusts the caller's prevout identity, amount, and script. It does not fetch or prove the referenced output, enforce dust or relay policy, select UTXOs, call RPC, broadcast, or validate TSS/key-generation/signing behavior. The original `construct`/`digest`/`finalize` operations remain transparent-only; the new Orchard operations use the separate PCZT path above. Neither path supports multiple inputs. Node acceptance remains a separate gate.

The public signature in `examples/finalize-known-fixture.json` is a historical synthetic scalar-1 test fixture. The source contains no private key and no signing path.

## Exact dependency and source basis

`Cargo.toml` pins every direct dependency exactly and `Cargo.lock` fixes the full graph. Direct versions are:

| Crate | Version | Role |
| --- | ---: | --- |
| `zcash_primitives` | 0.30.1 | v5 parsing, ZIP-244 digest, ZIP-317 fee rule, serialization |
| `zcash_protocol` | 0.10.5 | branch IDs, heights, bounded zatoshis |
| `zcash_transparent` | 0.10.0 | transparent bundles and sighash context |
| `zcash_script` | 0.4.3 | actual script evaluator and signature callback |
| `secp256k1` | 0.29.1 | compact signature, low-S and public-key parsing, canonical DER |
| `sha2` / `ripemd` | 0.10.9 / 0.1.3 | P2PKH public-key hash binding |
| `serde` / `serde_json` | 1.0.229 / 1.0.151 | strict JSON boundary |
| `hex` | 0.4.3 | wire encoding |
| `sapling-crypto` / `orchard` | 0.7.0 / 0.15.5 | authorization types required by transaction generics |
| `pczt` | vendored 0.9.3 source | Orchard proof/IO/sign/extract roles |
| `zcash_address` / `zcash_note_encryption` | 0.13.0 / 0.4.2 | UA parsing and output ciphertext recovery |

The locked `zcash_script 0.4.3` registry checksum is `c6ef9d04e0434a80b62ad06c5a610557be358ef60a98afa5dbc8ecaf19ad72e7`; its packaged VCS commit is `8a0b0c7cba1e89bcd8e5de0ebdbf8a232aa749d2`. The implementation was checked against the installed primary crate sources for `zcash_primitives::transaction::{sighash, fees::zip317}`, `zcash_transparent::sighash`, `secp256k1::ecdsa`, and `zcash_script::{script, interpreter, signature}`. Protocol references are [ZIP 244](https://zips.z.cash/zip-0244) and [ZIP 317](https://zips.z.cash/zip-0317).

`SHA256SUMS.txt` records the review-candidate source bytes and excludes Cargo build output.

## Validation matrix

Run:

```powershell
cargo fmt --all -- --check
cargo test --locked --offline
cargo run --locked --offline -- --input examples\digest.json
cargo run --locked --offline -- --input examples\finalize-known-fixture.json
```

The tests cover exact construction of the frozen funded-withdrawal bytes, txid, digest and fees; explicit field and output ordering; malformed and null outpoints; amount, script, output-count, unknown-field and numeric bounds; the CLI request-size limit; the independent checkpoint-001 txid/digest golden; exact checkpoint-002 DER+ALL, scriptSig and signed serialization; native ZIP-317 10,000-zat and 20,000-zat cases; output, prevout amount, branch and expiry mutations rejected by actual CHECKSIG with one callback; altered valid compact signature; malformed and high-S signatures; malformed and hash-mismatched public keys; branch mismatch; trailing bytes; negative and out-of-range amounts; negative fee; input/output cardinality; prefilled scriptSig; unsupported prevout script; and unknown JSON fields or operations.

Validation toolchain: `rustc 1.98.1 (48a229cea 2026-09-01)`, host `x86_64-pc-windows-msvc`; `cargo 1.98.1 (797e8a9bc 2026-08-05)`.

The checkpoint-007 native suite has 20 passing tests (19 library, one CLI),
including isolated positional-input, positional-output and duplicate-key cases.
