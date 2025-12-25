# @rosen-bridge/rosen-extractor

## 11.1.2

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@4.0.0
  - @rosen-bridge/tokens@5.0.0

## 11.1.1

### Patch Changes

- Throw error when tx cbor output is not set on ogmios client

## 11.1.0

### Minor Changes

- Add optional `storeRawData` parameter to control whether raw transaction data should exist in RosenData object

## 11.0.0

### Major Changes

- Save Cardano rawData in CBOR format
- Remove Cardano GraphQL module (no longer maintained)

## 10.1.1

### Patch Changes

- Fix package-lock and move typescript and types/node into root
- Update dependencies
  - @rosen-bridge/abstract-logger@3.0.1
  - @rosen-bridge/address-codec@1.0.1
  - @rosen-bridge/json-bigint@1.1.0
  - @rosen-bridge/tokens@4.0.1

## 10.1.0

### Minor Changes

- Add rawData value to The RosenData interface

### Patch Changes

- Remove unused dependencies and install missed dependencies

## 10.0.0

### Major Changes

- Update node version to 22.18

### Patch Changes

- Fix Bitcoin Runes extractors for unordered transactions
- Fix BitcoinRunesRosenExtractor to fully extract RosenData
- Update dependencies
  - @rosen-bridge/abstract-logger@3.0.0
  - @rosen-bridge/address-codec@1.0.0
  - @rosen-bridge/json-bigint@1.0.0
  - @rosen-bridge/tokens@4.0.0

## 9.0.0

### Major Changes

- Rename Runes chain name to Bitcoin Runes

### Patch Changes

- Update Bitcoin Runes getLockDataChunks to ignore the first 3 output boxes

## 8.1.0

### Minor Changes

- Update versions of nodejs to 20.11 & typescript to 5.8

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@2.1.0
  - @rosen-bridge/address-codec@0.7.0
  - @rosen-bridge/json-bigint@0.2.0
  - @rosen-bridge/tokens@3.2.0

## 8.0.1

### Patch Changes

- Downgrade ethers version
- Updated dependencies
  - @rosen-bridge/address-codec@0.6.3

## 8.0.0

### Major Changes

- Unify Cardano interfaces (this change only affects `CardanoTx` interface which is used in `CardanoRosenExtractor.extractRawData`)
  - Use new `CardanoTxInput` interface for `CardanoTx.inputs` which only has `txId` and `index` fields
  - Rename `policy_id` to **`policyId`** and `asset_name` to **`assetName`** in `CardanoAsset` interface

### Patch Changes

- Update dependencies
  - @rosen-bridge/tokens@3.1.1

## 7.3.3

### Patch Changes

- Update ethers version to v6.14.3
- Updated dependencies
  - @rosen-bridge/address-codec@0.6.2

## 7.3.2

### Patch Changes

- Replace tiny-secp256k1 dependency with @bitcoinerlab/secp256k1
- Updated dependencies
  - @rosen-bridge/address-codec@0.6.1

## 7.3.1

### Patch Changes

- Export TokenTransformation type

## 7.3.0

### Minor Changes

- Implement rosen extractor for Bitcoin Runes

### Patch Changes

- Updated dependencies
  - @rosen-bridge/address-codec@0.6.0

## 7.2.2

### Patch Changes

- Improve EvmEthersRosenExtractor performance by checking address before type conversion and full validation
- Updated dependencies
  - @rosen-bridge/address-codec@0.5.2
  - @rosen-bridge/tokens@3.1.0

## 7.2.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/tokens@3.0.0

## 7.2.0

### Minor Changes

- Update koios rosen extractor to use the new interfaces from cardano serialization lib

### Patch Changes

- Use cardano serialization lib v13
- Updated dependencies
  - @rosen-bridge/address-codec@0.5.1

## 7.1.1

### Patch Changes

- Fix RPC types of doge

## 7.1.0

### Minor Changes

- Add RPC to for Doge

## 7.0.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/address-codec@0.5.0

## 7.0.0

### Major Changes

- Constructor get `TokenMap` instead of `RosenTokens`

### Minor Changes

- Add rosen extractor for the dogecoin blockchain

### Patch Changes

- Fix floating error in BitcoinRpcRosenExtractor
- Updated dependencies
  - @rosen-bridge/tokens@2.0.0

## 6.3.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/tokens@1.2.2
  - @rosen-bridge/address-codec@0.4.0

## 6.3.0

### Minor Changes

- Add Binance chain

## 6.2.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-logger@2.0.1

## 6.2.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-logger@2.0.0

## 6.2.0

### Minor Changes

- Verify destination address encoded in lock transactions

### Patch Changes

- Updated dependencies
  - @rosen-bridge/address-codec@0.3.0

## 6.1.1

### Patch Changes

- fix EvmRosenExtractor serialization

## 6.1.0

### Minor Changes

- add EvmEthersRosenExtractor

## 6.0.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/tokens@1.2.1

## 6.0.0

### Major Changes

- consider decimals drop in AbstractRosenDataExtractor

### Patch Changes

- Updated dependencies
  - @rosen-bridge/tokens@1.2.0

## 5.0.1

### Patch Changes

- Fix btc rpc extractor to extract amount without decimal

## 5.0.0

### Major Changes

- change fromAddress to first input box ID (Only for Bitcoin)

### Minor Changes

- add bitcoin RPC rosen extractor

## 4.1.1

### Patch Changes

- fix bitcoin rosen-extractors (remove PUSH_DATA1 opcode from expected OP_RETURN script)

## 4.1.0

### Minor Changes

- allow custom order for tx outputs in bitcoin extractors

## 4.0.1

### Patch Changes

- check token availability on target chain
- Updated dependencies
  - @rosen-bridge/address-codec@0.2.1

## 4.0.0

### Major Changes

- change EvmRosenExtractor tx format

### Minor Changes

- add universal evm rosen extractor

## 3.5.0

### Minor Changes

- RPC rosen extractor added for EVM chains

### Patch Changes

- Updated dependencies
  - @rosen-bridge/address-codec@0.2.0

## 3.4.0

### Minor Changes

- add universal bitcoin rosen extractor
