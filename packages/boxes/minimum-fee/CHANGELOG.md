# @rosen-bridge/minimum-fee

## 3.1.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@4.0.0

## 3.1.0

### Minor Changes

- Update rosen clients

## 3.0.1

### Patch Changes

- Fix package-lock and move typescript and types/node into root
- Update dependencies
  - @rosen-bridge/abstract-logger@3.0.1
  - @rosen-bridge/json-bigint@1.1.0

## 3.0.0

### Major Changes

- Update node version to 22.18

### Patch Changes

- Update dependencies
  - @rosen-clients/ergo-explorer@2.0.0
  - @rosen-clients/ergo-node@3.0.0
  - @rosen-bridge/abstract-logger@3.0.0
  - @rosen-bridge/json-bigint@1.0.0

## 2.3.0

### Minor Changes

- Update versions of nodejs to 20.11 & typescript to 5.8

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@2.1.0
  - @rosen-bridge/json-bigint@0.2.0

## 2.2.3

### Patch Changes

- Update ergo node and explorer clients

## 2.2.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-logger@2.0.1

## 2.2.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-logger@2.0.0

## 2.2.0

### Minor Changes

- add `prune` function to remove unused chains (i.e. chains without config)

## 2.1.0

### Minor Changes

- add a function to get fee from MinimumFeeBox
- add a function to get fee from MinimumFeeBoxBuilder
- enable MinimumFeeConfig initialization from fee config
- export fee ratio divisor constant
- export a function to extract fee config from ErgoBox
- export a function to convert fee config to register values

## 2.0.1

### Patch Changes

- fix fetching config box for Erg

## 2.0.0

### Major Changes

- Update api calls to use token and remove required address

### Patch Changes

- update ergo explorer and node clients

## 1.0.2

### Patch Changes

- remove previous fetched box in case that no box or multiple boxes is found
