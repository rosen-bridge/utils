# @rosen-bridge/address-codec-zcash

Transparent P2PKH address encoding for Zcash in Rosen Bridge. The shared codec
registry uses mainnet. Testnet and regtest callers must select their network
through `createZcashAddressCodec` and independently bind the node genesis.

Shielded, Unified, P2SH, and TEX addresses are outside this initial profile.
