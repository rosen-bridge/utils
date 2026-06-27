# @rosen-bridge/winston-logger

## 3.1.0

### Minor Changes

- Add json formatting, serviceName, and symlink support for file transport:
  - Add `format` option to `FileTransportOptions` supporting both `'plain'` and `'json'` outputs (recommended for Grafana Alloy tailing)
  - Add `serviceName` option to `FileTransportOptions` to inject service name label into log entries
  - Add `createSymlink` and `symlinkName` options to `FileTransportOptions`
  - Add a console warning to the `loki` transport for notifying users about potential log-loss risks

## 3.0.1

### Patch Changes

- Fix path computation for Winston logger

## 3.0.0

### Major Changes

- Add `child` method to logger classes and delete the logger factory class

### Minor Changes

- Add `critical` and `trace` log level

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@4.0.0

## 2.0.1

### Patch Changes

- Fix package-lock and move typescript and types/node into root
- Update dependencies
  - @rosen-bridge/abstract-logger@3.0.1
  - @rosen-bridge/json-bigint@1.1.0

## 2.0.0

### Major Changes

- Update node version to 22.18

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@3.0.0
  - @rosen-bridge/json-bigint@1.0.0

## 1.1.0

### Minor Changes

- Update versions of nodejs to 20.11 & typescript to 5.8

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@2.1.0
  - @rosen-bridge/json-bigint@0.2.0

## 1.0.3

### Patch Changes

- Update winston package version

## 1.0.2

### Patch Changes

- Fix build process

## 1.0.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-logger@2.0.1

## 1.0.0

### Major Changes

- Remove signleton feature from factory class

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-logger@2.0.0
