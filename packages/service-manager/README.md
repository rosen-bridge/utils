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

Before diving into the implementation details, it is important to understand the concept of actions in this context. In this system, actions refer to the operations of starting and stopping a service. These actions are requested by various components and are stored in a `Map` data structure called `pendingActions`. This map keeps track of the requested actions for each service id.

Each action has some requirements which oversees service dependencies or dependants based on the action operation, i.e. "start" action requires service dependencies to be in appropriate state and "stop" requires service dependants to be stopped. For instance, if service A depends on service B, starting A requires service B to be in "running" state.

### Action Scenario

The process of starting and stopping services in this system follows a hierarchical structure. This means that the start and stop operations of services are performed in a cascading manner, where starting a service triggers the start of its dependent services, and stopping a service also stops its dependants. Service manager checks and behaviors includes:

- Pending Action Check:

  - Before any action is initiated, a check is performed to determine if there are any pending actions for the corresponding service in the `pendingActions` map.
  - If no pending actions are found for the service, the new action is added to the action map.
  - The action requirements are then examined and the necessary steps are taken to ensure they are satisfied.
  - Only when all requirements are met, the action is executed for the service.

- Dependency Status Handling:

  - Dependencies are handled through action requirements.
  - For instance, if Service B depends on Service C and Service M, the status of these two services is checked for the "start" operation.
  - If either Service C or Service M is not in the "running" state, the "start" operation for Service B is prevented.
  - Conversely, when both Service C and Service M reach the appropriate states, the `startService` method is invoked for Service B.

- Action Collision Handling:

  - If there is already a different pending action for the same service in the `pendingActions` map, an appropriate error is returned to prevent a potential action collision.

- Dependency Resolution:

  - If the same action is already present in the `pendingActions`, the dependencies are re-evaluated.
  - If all dependencies are in the appropriate state, the action proceeds.
  - If some dependencies are still not ready, the promise stored in the `pendingPromises` for this service is returned.

By overseeing the functionalities described above, we ensure that the system starts and stops services in a controlled and cascading manner, taking into account their dependencies and maintaining the integrity of the system.

### Service Status Change

ServiceManager works not only by performing actions, but also by changes in service statuses. When a service undergoes a status change, the `ServiceManager` becomes aware of it through the `callbackHandler` function. In such cases, depending on the next status, the following actions should take place:

- If the next status is "started" or "running," the dependants of the service need to be examined. If they have a pending "start" operation in the `pendingActions` map and all their dependencies are ready, the operation is executed along with resolving or rejecting the current operation.

- If the next status is "dormant," all dependants of the service must be stopped. Additionally, all dependencies of the service should be checked, and if there are pending "stop" operations in the `pendingActions` map and their requirements are satisfied, `stopService` is invoked. It is important to note that the responsibility of managing a service that is already stopped and should not be stopped again lies with the `AbstractService` itself.

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

  protected dependencies: Dependency[] = [];

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
