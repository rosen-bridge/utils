# @rosen-bridge/cli

## 2.1.3

### Patch Changes

- Update dependencies
  - @rosen-bridge/utils@3.0.0

## 2.1.2

### Patch Changes

- Update dependency @rosen-bridge/encryption@1.0.1

## 2.1.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/utils@2.0.2

## 2.1.0

### Minor Changes

- Replace json-bigint dependency with @rosen-bridge/json-bigint

### Patch Changes

- Fix package-lock and move typescript and types/node into root
- Update dependencies
  - @rosen-bridge/utils@2.0.1

## 2.0.1

### Patch Changes

- Remove unused dependencies and install missed dependencies

## 2.0.0

### Major Changes

- Update node version to 22.18

### Patch Changes

- Migrated from @rosen-bridge/tss to @rosen-bridge/encryption package
- Update dependencies
  - @rosen-bridge/utils@2.0.0

## 1.1.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/utils@1.0.0

## 1.1.0

### Minor Changes

- Update versions of nodejs to 20.11 & typescript to 5.8

### Patch Changes

- Update dependencies
  - @rosen-bridge/utils@0.3.0

## 1.0.0

### Major Changes

- Migrate from node 18.17 to 20.11

## 0.7.0

### Minor Changes

- add download-tss command to cli to download tss binary via release tag

### Patch Changes

- Updated dependencies
  - @rosen-bridge/utils@0.2.0

## 0.6.0

### Minor Changes

- Add "--tag" argument for downloading assets of specific tag (instead of latest)

### Patch Changes

- Updated dependencies
  - @rosen-bridge/utils@0.1.0

## 0.5.0

### Minor Changes

- Change tss-secret-generate to tss-secret generate/convert-to-pk

## 0.4.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/tss@3.0.0

## 0.4.0

### Minor Changes

- update tss-secret-generate command to generate secret and pk for both protocols ecdsa and eddsa

### Patch Changes

- Updated dependencies
  - @rosen-bridge/tss@2.0.1

## 0.3.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/tss@2.0.0

## 0.3.1

### Patch Changes

- Add salt to the apiKey generator to prevent precomputed hash attacks.

## 0.3.0

### Minor Changes

- A weak flag and password checker added to blake2b-hash command
