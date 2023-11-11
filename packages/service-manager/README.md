# @rosen-bridge/service-manager

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Implementation Details](#implementation-details)
- [Usage](#usage)

## Introduction

`@rosen-bridge/service-manager` is a Typescript package to simplify auto-start and auto-stop service management in a hierarchical structure, ensuring proper startup order and dependency handling.

With this package, developers can streamline the process of managing services by automating the startup and shutdown procedures. It takes care of the complexities involved in handling dependencies between services, ensuring that they start in the correct order to avoid any conflicts or issues. By using this package, developers can focus on building their applications while relying on the service manager to handle the service lifecycle efficiently and effectively.

## Installation

npm:

```sh
npm i @rosen-bridge/service-manager
```

yarn:

```sh
yarn add @rosen-bridge/service-manager
```

## Implementation Details

### Action Scenario

The process of starting and stopping services in this system follows a hierarchical structure. This means that the start and stop operations of services are performed in a cascading manner, where starting a service triggers the start of its dependent services, and stopping a service also stops its dependents. This document provides an overview of the implementation details for this functionality.

1. Pending Action Check:

   - Before any action is initiated, a check is performed to determine if there are any pending actions for a specific service in the `pendingActions` list.
   - If no pending actions are found, the new action is added to the action map.
   - The dependencies of the action are then examined to ensure they are in the appropriate state.
   - If any dependencies are not in the required state, the necessary steps are taken to change their state accordingly.
   - Only when all dependencies are in the appropriate state, the action is executed for the target service.

2. Dependency Status Handling:

   - For instance, if Service B depends on Service C and Service M, the status of these two services is checked.
   - If either Service C or Service M is not in the "running" state, the "start" operation for Service B is prevented.
   - Conversely, when both Service C and Service M transition to the appropriate state, the "startService" method is invoked for Service B.

3. Duplicate Action Handling:

   - If there is already a pending action for the same service in the `pendingActions` list, an appropriate error is returned to avoid duplicate actions.

4. Dependency Resolution:

   - If the same action is already present in the `pendingActions`, the dependencies are re-evaluated.
   - If all dependencies are in the appropriate state, the action proceeds.
   - If some dependencies are still not ready, the promise stored in the `pendingPromises` for this service is returned.

5. Start and Stop Operation Management:
   - When starting a service, all its dependencies are ensured to be met before initiating the start operation.
   - Conversely, when stopping a service, its dependents are examined to ensure a proper shutdown sequence.

By following this implementation approach, services are started and stopped in a controlled manner, considering their dependencies and maintaining the integrity of the system.

### Service Status Change

When a service undergoes a status change, the `ServiceManager` becomes aware of it through the `callbackHandler` function. In such cases, depending on the destination status, the following actions should take place:

- If the destination status is "started" or "running," the dependents of the service need to be examined. If they have a pending "start" operation in the `pendingActions` list and all their dependencies are ready, the operation is executed along with resolving or rejecting the current operation.

- If the destination status is "dormant," all dependents of the service must be stopped. It is important to note that the responsibility of managing a service that is already stopped and should not be stopped again lies with the `AbstractService` itself. Additionally, all dependencies of the service should be checked, and if there are pending "stop" operations in the `pendingActions` list and their dependencies are ready, similar to the previous case, the operations are executed.

By implementing these actions based on the service status change, we ensure that the dependents are appropriately handled and that the system maintains the desired state and behavior.

## Usage

First you need to define your services while inheriting `AbstractService` class. Don't forget to define dependencies. In this example, service `X1A` depends on `X1B`.

```ts
import { AbstractService } from '@rosen-chains/service-manager';

class X1A extends AbstractService {
  name = 'X1A';

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X1B',
      allowedStatuses: [ServiceStatus.running],
    },
  ];

  // implement other required functions
  // ...
}

class X1B extends AbstractService {
  name = 'X1B';

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X1M',
      allowedStatuses: [ServiceStatus.running],
    },
  ];

  // implement other required functions
  // ...
}
```

Then initialize `ServiceManager` instance and register your services.

```ts
import { ServiceManager } from '@rosen-chains/service-manager';

const serviceManager = ServiceManager.setup();
const serviceX1A = new X1A();
serviceManager.register(serviceX1A);
const serviceX1B = new X1B();
serviceManager.register(serviceX1B);
```

Then you can start and stop services using service manager.

```ts
serviceManager.start(serviceX1A.getName());
```

```ts
serviceManager.stop(serviceX1A.getName());
```
