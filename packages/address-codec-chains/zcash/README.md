# @rosen-bridge/address-codec-zcash

Zcash destination validation and transparent P2PKH address encoding for Rosen
Bridge. The shared codec registry uses mainnet. Testnet and regtest callers must
select their network through `createZcashAddressCodec` and independently bind
the node genesis.

`parseRecipient` and `validateAddress` accept transparent P2PKH addresses and
canonical lowercase revision-0 Unified Addresses containing an Orchard receiver.
The Unified Address profile admits only known P2PKH, P2SH, Sapling and Orchard
items, in canonical order, with at most one transparent item. Unknown items,
metadata, other revisions and addresses without Orchard are unsupported. Parsing
is bounded to 256 characters and 128 decoded bytes. The Orchard transmission key
must be a canonical nonidentity Pallas point.
Every Sapling item must also have a valid diversifier and a canonical,
nonidentity prime-order Jubjub transmission key. An invalid constituent rejects
the complete Unified Address even when its Orchard receiver is valid.

An Orchard result is `{ kind: 'orchard', network, address, receiverHex }`.
`address` preserves the exact accepted Unified Address; `receiverHex` is its
43-byte Orchard receiver. No transparent fallback or replacement address is
selected. A payment verifier must independently derive this receiver from the
event address and bind it and the amount to the actual shielded output.

`parseAddress` and `validateTransparentAddress` remain P2PKH-only. Use these for
reserve and cold-wallet configuration. `encodeAddress` and `decodeAddress` retain
the existing 22-byte transparent payload and reject Unified Addresses. Destination
validation therefore does not imply compact-payload encodability. Ergo lock and
event registers already carry the full address as UTF-8; their format is unchanged.

The decoder follows [ZIP 316](https://zips.z.cash/zip-0316). Test fixtures were
generated with `zcash_address` 0.13.0 at
`882ecd278050bb92365c9d1250c55f0dadc0f648`, its official Unified Address vectors,
`f4jumble` 0.1.1, `orchard` 0.15.5 and `sapling-crypto` 0.7.0. They cover all three
networks, exact receiver bytes, malformed encodings, unsupported profiles, invalid
Orchard keys, and invalid Sapling diversifiers and keys beside valid Orchard.
