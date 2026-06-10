# @rosen-bridge/service-manager

## 3.0.0

### Major Changes

- Change `name` to `serviceName` in the `AbstractService`. It also throws error in the `getName` function if it's not defined

### Minor Changes

- Improve handling name of services in the `AbstractService` (Now it's possible to define the name as a static property of the service parent class)

### Patch Changes

- Improve the logs on the `AbstractService` where the successful message was logged even when the action was failed
- - Replaced the `await-semaphore` dependency with `@rosen-bridge/semaphore`

## 2.0.0

### Major Changes

- Add `Assemble` feature: Services now should have a new function, `assemble`, which performs a one-time action, such as initializing the service hyper parameters and classes. Additionally, the `ServiceManager` handles it, requesting to assemble services in the `raw` status (the new status representing the non-assembled services) when they are going to be started or required.
- Add `action` to `Dependency` interface: Now dependency definition requires the action and the relation is checked only when the corresponding action is being performed.

### Patch Changes

- Fix a bug where the dependant won't be stopped when it's dependency becomes `started` from `running` status

## 1.0.2

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@4.0.0

## 1.0.1

### Patch Changes

- Fix package-lock and move typescript and types/node into root
- Update dependencies
  - @rosen-bridge/abstract-logger@3.0.1

## 1.0.0

### Major Changes

- Update node version to 22.18

### Minor Changes

- Remove taskName from periodicTask service and export Task type

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@3.0.0

## 0.3.0

### Minor Changes

- Add periodicTaskService to service-manager package

## 0.2.0

### Minor Changes

- Update versions of nodejs to 20.11 & typescript to 5.8

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@2.1.0

## 0.1.2

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-logger@2.0.1

## 0.1.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/abstract-logger@2.0.0
