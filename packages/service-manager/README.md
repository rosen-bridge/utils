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

Before diving into the implementation details, it is important to understand the concept of actions in this context. In this system, actions refer to the three operations of the service lifecycle: **assemble**, **start**, and **stop**. These actions are requested by various components and are stored in a `Map` data structure called `pendingActions`. This map keeps track of the requested actions for each service id.

> **Note:** "Assemble" is the initialization phase of a service — it is where the service sets up its internal parameters, and instantiates the classes it needs to operate. A fully assembled service moves from `raw` to `dormant`, meaning it is ready to be started but has not yet begun active work.

Each action has requirements that govern its execution. The `assemble` action requires its `assemble`-typed dependencies to be in the appropriate state. The `start` action requires all of its dependencies (both `assemble`- and `start`-typed) to be in the appropriate state. The `stop` action requires all `start`-typed dependants to be stopped first.

### Service Lifecycle

Every service passes through the following statuses in order:

| Status    | Meaning                                                |
| --------- | ------------------------------------------------------ |
| `raw`     | Initial state – the service has not yet been assembled |
| `dormant` | Assembled and ready, but not yet started               |
| `started` | Start sequence in progress                             |
| `running` | Fully operational                                      |

A service must be assembled (`raw` → `dormant`) before it can be started (`dormant` → `started` / `running`). Note that it cannot return back to `raw`.

### Dependency

Each dependency entry in a service has three fields:

- **`serviceName`** – the name of the required service.
- **`allowedStatuses`** – the set of statuses the required service must be in for the dependency to be considered satisfied.
- **`action`** – which action this requirement belongs to:
  - `ServiceAction.assemble` – this dependency must be satisfied before the service can be **assembled**. It is also checked when the service is being **started**, but the dependency is only _assembled_ (not started) to satisfy the requirement.
  - `ServiceAction.start` – this dependency must be satisfied before the service can be **started**. When the required service goes dormant, dependants with a `start`-typed dependency on it are automatically stopped.

Each service has `assembleService`, `startService`, and `stopService` methods which are only called after all requirements of their respective actions are satisfied.

### Action

Actions follow a cascading pattern. Service manager checks and behaviors include:

- Pending Action Check:
  - Before any action is initiated, a check is performed to determine if there are any pending actions for the corresponding service in the `pendingActions` map.
  - If no pending action is found for the service, the new action is added to the action map.
  - The action requirements are then examined and the necessary steps are taken to ensure they are satisfied.
  - Only when all requirements are met, the action is executed for the service.

- Action Collision Handling:
  - If there is already a different pending action for the same service in the `pendingActions` map, an appropriate error is returned to prevent a potential action collision.
  - Exception: calling `assemble` when `start` or `stop` is already pending is treated as a no-op (the service is already past the `raw` state).

- Dependency Resolution:
  - If the same action is already present in the `pendingActions`, the dependencies are re-evaluated.
  - If all dependencies are in the appropriate state, the action proceeds.
  - If some dependencies are still not ready, the promise of current pending action for this service which is stored in the `pendingPromises`, is returned.

- Dependency Handling:
  - Dependencies are handled through action requirements.
  - For the `assemble` action: only `assemble`-typed dependencies are checked. Each unsatisfied one triggers a recursive `assemble` call on that dependency.
  - For the `start` action: all dependencies (both `assemble`- and `start`-typed) are checked. Each unsatisfied `assemble`-typed dependency triggers `assemble` on it, while each unsatisfied `start`-typed dependency triggers `start` on it.
    - For instance, if Service B has a `start` dependency on Service C (allowedStatuses: `[running]`) and an `assemble` dependency on Service M (allowedStatuses: `[dormant, started, running]`), starting B requires C to be running and M to be at least assembled. If M is not yet assembled, `assemble(M)` is called; if C is not yet running, `start(C)` is called.
  - For the `stop` action: only `start`-typed dependants block the stop. `assemble`-typed dependants are left running because they only needed the service to be assembled, not kept alive.

By overseeing the functionalities described above, we ensure that the system manages services in a controlled and cascading manner, taking into account their dependencies and maintaining the integrity of the system.

### Service Status Change

ServiceManager works not only by performing actions, but also by changes in service statuses. When a service undergoes a status change, the ServiceManager becomes aware of it through the `callbackHandler` function. In such cases, depending on the next status, the following actions take place:

- If the new status is included in a dependant's `allowedStatuses` for its dependency on this service, that dependant is examined:
  - If it has a pending `start` action and all of its dependencies are satisfied, `startService` is invoked.
  - If it has a pending `assemble` action, its `assemble`-typed dependency on this service is satisfied, and all other `assemble`-typed dependencies are also satisfied, `assembleService` is invoked.
  - This check correctly handles the case where an `assemble`-typed dependency becomes `dormant` and `dormant` is listed in the dependant's `allowedStatuses` — which would unblock any service waiting to start or assemble.

- If the new status is `dormant`:
  - All `start`-typed dependants of the service are stopped. `assemble`-typed dependants are left running — they only depended on this service being assembled, not on it remaining active.
  - All `start`-typed dependencies of the service are examined: if they have a pending `stop` action and all of their `start`-typed dependants are now dormant, `stopService` is invoked on them.
  - It is important to note that the responsibility of managing a service that is already stopped and should not be stopped again lies with the `AbstractService` itself.

By implementing these actions based on the service status change, we ensure that the dependents are appropriately handled and that the system maintains the desired state and behavior.

## Usage

First you need to define your services while inheriting `AbstractService` class. Each dependency entry now requires an `action` field (`ServiceAction.start` or `ServiceAction.assemble`) that controls which lifecycle phase the dependency belongs to.

In this example, `X1A` has a `start` dependency on `X1B` (X1B must be running before X1A can start), while `X1B` has an `assemble` dependency on `X1C` (X1C only needs to be assembled before X1B can be assembled).

```ts
import {
  AbstractService,
  Dependency,
  ServiceAction,
  ServiceStatus,
} from '@rosen-bridge/service-manager';

class X1A extends AbstractService {
  name = 'X1A';

  protected dependencies: Dependency[] = [
    {
      serviceName: 'X1B',
      allowedStatuses: [ServiceStatus.running],
      action: ServiceAction.start,
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

Then initialize a `ServiceManager` instance and register your services.

```ts
import { ServiceManager } from '@rosen-bridge/service-manager';

const serviceManager = ServiceManager.setup();
const serviceX1A = new X1A();
serviceManager.register(serviceX1A);
const serviceX1B = new X1B();
serviceManager.register(serviceX1B);
```

You can assemble, start, and stop services using the service manager.

```ts
// Assemble a service (raw → dormant). Cascades to assemble-typed dependencies.
serviceManager.assemble(serviceX1C.getName());
```

```ts
// Start a service (dormant → started/running). Cascades to all dependencies:
// assemble-typed ones are assembled, start-typed ones are started.
serviceManager.start(serviceX1A.getName());
```

```ts
// Stop a service. Only start-typed dependants are stopped first;
// assemble-typed dependants are left running.
serviceManager.stop(serviceX1A.getName());
```

### Using `PeriodicTaskService`

`PeriodicTaskService` is an abstract class designed to manage periodic services, allowing you to schedule and execute tasks at defined intervals. To use this class, you need to extend it and implement the necessary methods: `preStart`, `postStop`, and `getTasks`.

`preStart` is used to initialize and prepare the periodic task materials. The `postStop` method is called after stopping all threads and is used to clean up the service after the periodic tasks have stopped. Finally, the `getTask` method returns all periodic tasks and their running intervals.

#### 1. Creating a Periodic Task Service

define a new class that extends `PeriodicTaskService` and implement the required methods.

```ts
import { PeriodicTaskService } from '@rosen-bridge/service-manager';

class MyPeriodicTaskService extends PeriodicTaskService {
  taskName = 'MyPeriodicTaskService';

  protected async starterService() {
    this.logger.info('initializing requirements ...');
  }

  protected async stoperService() {
    this.logger.info('service state has been changed to "stopped"');
  }

  protected getTasks() {
    return [
      {
        fn: this.someTask,
        interval: 5000,
      },
    ];
  }

  private someTask = async () => {
    this.logger.info('Executing periodic task');
    // task logic here
  };
}
```
