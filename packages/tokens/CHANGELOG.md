# @rosen-bridge/tokens

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
