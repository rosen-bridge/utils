---
'@rosen-bridge/address-codec-ergo': patch
---

Reject Ergo addresses the codec cannot represent: encoding or validating a testnet or non-P2PK address now throws UnsupportedAddressError instead of storing bytes that would decode into a different (mainnet P2PK) address or fail to decode.
