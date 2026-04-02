---
'@rosen-bridge/rosen-extractor': major
---

Remove `@rosen-bridge/address-codec` from dependency. All Rosen extractors now depend on the `AddressManager` class from `@rosen-bridge/address-manager` for the decoding and validation of addresses. It should be initialized independently (Please check [README](README.md) for it's usage).
