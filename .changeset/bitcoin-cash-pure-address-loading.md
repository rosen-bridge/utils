---
'@rosen-bridge/address-codec-bitcoin-cash': patch
---

Load CashAddr functions from the pure address module of the pinned libauth release, avoiding crypto WASM initialization when importing the address codec.
