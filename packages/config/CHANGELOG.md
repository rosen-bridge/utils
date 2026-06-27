# @rosen-bridge/config

## 2.1.0

### Minor Changes

- Add supporting union type in config
- Add secret field to PrimitiveValue fields

## 2.0.0

### Major Changes

- Add `fromSchemaFile` method for loading and parsing a `schema.json` file from a specified path.
- Add `buildConfigs` method to load configs, validate them, and return final config object.

### Patch Changes

- Add ValueType to enforce type safety and avoid any

## 1.2.0

### Minor Changes

- Support kebab-case keys in schema

## 1.1.0

### Minor Changes

- Replace json-bigint dependency with @rosen-bridge/json-bigint

### Patch Changes

- Fix package-lock and move typescript and types/node into root
- Update dependencies
  - @rosen-bridge/json-bigint@1.1.0

## 1.0.0

### Major Changes

- Update node version to 22.18

## 0.4.0

### Minor Changes

- Add functionality that enables array types and defaults
- Changed duplicate key behaviour to include the parent name instead

### Patch Changes

- Fix primitive type check for bigint field in schema validation

## 0.3.0

### Minor Changes

- Update versions of nodejs to 20.11 & typescript to 5.8

## 0.2.1

### Patch Changes

- add field validation for boolean type

## 0.2.0

### Minor Changes

- added array type support

## 0.1.0

### Minor Changes

- added validateAndWriteConfig method to the ConfigValidator class to validate and update node-config files.
- implemented major functionalities for config package
