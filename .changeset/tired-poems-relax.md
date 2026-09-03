---
'@rosen-bridge/rosen-extractor': patch
---

Fix a bug in the ERC-20 recipient check in `EvmRpcRosenExtractor` where a lock address starting with a zero nibble would've caused every ERC-20 lock transaction to be rejected
