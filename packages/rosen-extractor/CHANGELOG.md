# @rosen-bridge/rosen-extractor

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
