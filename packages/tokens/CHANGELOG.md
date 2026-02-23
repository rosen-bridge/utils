# @rosen-bridge/tokens

## 6.0.0

### Major Changes

- Remove `ERGO_SIDE_TOKEN_ID_KEY` and `REQUIRED_FIELDS` constants (You can import them from the [@rosen-bridge/extended-tokens package](https://www.npmjs.com/package/@rosen-bridge/extended-tokens)).

## 5.0.1

### Patch Changes

- Fix a bug where the `unbridgeableTokens` field was not initialized in the `constructor`

## 5.0.0

### Major Changes

- Remove the `updateConfigByBoxes` function (Please refer to [`@rosen-bridge/extended-tokens` package](https://www.npmjs.com/package/@rosen-bridge/extended-tokens))

### Minor Changes

- Support Unbridgeable tokens (i.e., token sets with exactly one non-Ergo token), they are considered in the `wrapAmount`, `unwrapAmount` and `getSignificantDecimals` functions
- Add a new argument to `TokenMap.getTokenSet` function, the `includeUnbridgeableTokens`, with the default value of `false`
- Add validations on tokens json that throws `CorruptedConfigError`
  - when a token set is empty
  - when a token set has more than one token without supporting `ergo`

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@4.0.0

## 4.0.1

### Patch Changes

- Fix package-lock and move typescript and types/node into root
- Update dependencies
  - @rosen-bridge/abstract-logger@3.0.1

## 4.0.0

### Major Changes

- Update node version to 22.18

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@3.0.0

## 3.2.0

### Minor Changes

- Update versions of nodejs to 20.11 & typescript to 5.8

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@2.1.0

## 3.1.1

### Patch Changes

- Fix potential floating error in `wrapAmount` and `unwrapAmount` functions

## 3.1.0

### Minor Changes

- Add callback support to `TokenMap` class
- Add logger to `TokenMap` class

## 3.0.0

### Major Changes

- Revamp TokenMap structure
  - The extra fields per chain are now under `extra` field and only value of 'string', 'number' or 'boolean' is supported
  - The `search` function is improved and only accepts a partial object of `RosenChainToken` instead of any object

### Patch Changes

- Fix dependency type of the `await-semaphore` package (it is now strict instead of dev dependency)
- Change the `ergo-lib-wasm-nodejs` from static to dynamic import

## 2.0.0

### Major Changes

- Change TokenMap structure
  - remove tokens from constructor and add separate functions to set configs (one from token map config boxes and one from config json directly)
  - change IdKey to `tokenId` for all chains
  - remove getIdKey function
  - flat the metadata fields into token interface

### Patch Changes

- Update tests to vitest

## 1.2.1

### Patch Changes

- - add function to get significant decimals for a token
  - change wrapAmount logic to ceiling

## 1.2.0

### Minor Changes

- add functions to wrap token amount across chains with different decimals

## 1.1.0

### Minor Changes

- Add getAllNativeTokens function to return a chain supported tokens with native residency
