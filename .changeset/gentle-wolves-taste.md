---
'@rosen-bridge/rosen-extractor': major
---

Unify Cardano interfaces (this change only affects `CardanoTx` interface which is used in `CardanoRosenExtractor.extractRawData`)

- Use new `CardanoTxInput` interface for `CardanoTx.inputs` which only has `txId` and `index` fields
- Rename `policy_id` to **`policyId`** and `asset_name` to **`assetName`** in `CardanoAsset` interface
