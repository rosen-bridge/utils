---
'@rosen-bridge/rosen-extractor': minor
---

Remove `value` and `assets` fields from `CardanoUtxo` interface (renamed to `CardanoTxInput`)

- The `serializedTransaction` argument in `CardanoRosenExtractor.extractRawData` is stringified string of `CardanoTx` interface which uses this interface for its `inputs` field
