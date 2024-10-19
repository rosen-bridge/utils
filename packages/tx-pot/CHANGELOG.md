# @rosen-bridge/tx-pot

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
