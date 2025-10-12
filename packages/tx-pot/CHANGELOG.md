# @rosen-bridge/tx-pot

## 2.0.2

### Patch Changes

- Fix package-lock and move typescript and types/node into root
- Update dependencies
  - @rosen-bridge/abstract-logger@3.0.1
  - @rosen-bridge/extended-typeorm@1.0.1

## 2.0.1

### Patch Changes

- Remove unused dependencies and install missed dependencies

## 2.0.0

### Major Changes

- Update node version to 22.18

### Minor Changes

- Update typeorm version to 0.3.26

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@3.0.0
  - @rosen-bridge/extended-typeorm@1.0.0

## 1.1.0

### Minor Changes

- Update versions of nodejs to 20.11 & typescript to 5.8

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@2.1.0

## 1.0.3

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-logger@2.0.1

## 1.0.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-logger@2.0.0

## 1.0.1

### Patch Changes

- Update typeorm version

## 1.0.0

### Major Changes

- - add id to validator registration
  - support registering multiple callbacks using id

### Minor Changes

- add function to unregister validators and callbacks
- add function to register submit-only validator (validates tx for submit)
- add function to only update extra columns

## 0.1.1

### Patch Changes

- support multiple validators
  add extra fields to `addTx` function
  improve processing of `signed` and `sent` txs
