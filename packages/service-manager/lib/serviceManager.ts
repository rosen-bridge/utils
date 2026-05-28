import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';

import { AbstractService } from './abstractService';
import { Action, Dependency, ServiceAction, ServiceStatus } from './types';

export class ServiceManager {
  private static instance: ServiceManager;
  protected services = new Map<string, AbstractService>();
  protected onWatchServices: Array<string> = [];
  protected pendingActions = new Map<string, Action>();
  protected pendingPromises = new Map<string, Promise<boolean>>();
  protected logger: AbstractLogger;

  protected constructor(logger?: AbstractLogger) {
    this.logger = logger ?? new DummyLogger();
  }

  /**
   * initiates ServiceManager logger
   * @param logger
   */
  public static setup = (logger?: AbstractLogger): ServiceManager => {
    ServiceManager.instance = new ServiceManager(logger);
    ServiceManager.instance.logger.debug('ServiceManager instantiated');
    return ServiceManager.instance;
  };

  /**
   * generates a ServiceManager object if it doesn't exist
   * @returns ServiceManager instance
   */
  public static getInstance = (): ServiceManager => {
    if (!ServiceManager.instance)
      throw Error(`ServiceManager instance doesn't exist`);
    return ServiceManager.instance;
  };

  /**
   * handles changing status of a service
   * @param serviceName
   * @param previousStatus
   * @param newStatus
   */
  protected callbackHandler = (
    service: AbstractService,
    previousStatus: ServiceStatus,
    newStatus: ServiceStatus,
  ): void => {
    this.getServiceDependants(service.getName()).forEach((dependant) => {
      if (
        previousStatus !== ServiceStatus.raw &&
        dependant.action === ServiceAction.start &&
        !dependant.allowedStatuses.includes(newStatus)
      ) {
        // A 'start'-typed dep going dormant (after having been active) means
        // the dependant can no longer operate and must be stopped.
        // The extra `previousStatus !== raw` guard ensures that the normal
        // raw → dormant assembly transition does not wrongly cascade
        // a stop to dependants that haven't even started yet.
        this.getService(dependant.serviceName).stopService();
      } else if (dependant.allowedStatuses.includes(newStatus)) {
        // The dep just entered a status that satisfies the dependant's
        // requirement. This includes the case where an assemble-typed dep
        // becomes dormant and dormant is listed in the dependant's
        // allowedStatuses – something the old `newStatus !== dormant` guard
        // would have missed entirely.
        const dependantsPending = this.pendingActions.get(
          dependant.serviceName,
        );
        if (dependantsPending) {
          if (dependantsPending.action === ServiceAction.start) {
            // Check ALL dependencies (both start- and assemble-typed) because
            // starting a service requires every dependency to be satisfied.
            const dependenciesNotPassed = this.getService(dependant.serviceName)
              .getDependencies()
              .some(
                (dependency) =>
                  !dependency.allowedStatuses.includes(
                    this.getService(dependency.serviceName).getStatus(),
                  ),
              );
            if (!dependenciesNotPassed) {
              this.start(dependant.serviceName)
                .then(dependantsPending.resolve)
                .catch(dependantsPending.reject);
            }
          } else if (
            dependantsPending.action === ServiceAction.assemble &&
            dependant.action === ServiceAction.assemble
          ) {
            // This dependant only needs assemble-typed deps satisfied.
            const dependenciesNotPassed = this.getService(dependant.serviceName)
              .getDependencies()
              .filter((dep) => dep.action === ServiceAction.assemble)
              .some(
                (dependency) =>
                  !dependency.allowedStatuses.includes(
                    this.getService(dependency.serviceName).getStatus(),
                  ),
              );
            if (!dependenciesNotPassed) {
              this.assemble(dependant.serviceName)
                .then(dependantsPending.resolve)
                .catch(dependantsPending.reject);
            }
          }
        }
      }
    });

    if (
      newStatus === ServiceStatus.dormant &&
      previousStatus !== ServiceStatus.raw
    ) {
      // Only trigger the stop cascade for a genuine stop/failure transition.
      // A raw → dormant transition is assembly, not a stop, so it must
      // not kick off pending 'stop' actions on the service's dependencies.
      service
        .getDependencies()
        .filter((dep) => dep.action === ServiceAction.start)
        .forEach((dependency) => {
          const dependencyPending = this.pendingActions.get(
            dependency.serviceName,
          );
          if (
            dependencyPending &&
            dependencyPending.action === ServiceAction.stop
          ) {
            // A dependency can be stopped only when all its 'start' dependants
            // are dormant (assemble-only dependants don't block the stop).
            const dependenciesNotPassed = this.getServiceDependants(
              dependency.serviceName,
            )
              .filter((dep) => dep.action === ServiceAction.start)
              .some(
                (dep) =>
                  this.getService(dep.serviceName).getStatus() !==
                  ServiceStatus.dormant,
              );
            if (!dependenciesNotPassed) {
              this.stop(dependency.serviceName)
                .then(dependencyPending.resolve)
                .catch(dependencyPending.reject);
            }
          }
        });
    }
  };

  /**
   * adds a service to the manager
   * @service service object
   */
  register = (service: AbstractService): void => {
    const serviceName = service.getName();
    if (this.services.has(serviceName))
      throw new Error(`Service [${serviceName}] is already registered`);
    this.services.set(serviceName, service);
    service.addCallback(this.callbackHandler);
  };

  /**
   * assembles a service and its assemble-typed dependencies
   * @param serviceName
   */
  assemble = (serviceName: string): Promise<boolean> => {
    this.logger.debug(
      `request to assemble [${serviceName}] in service manager`,
    );
    const service = this.getService(serviceName);

    const servicePendingAction = this.pendingActions.get(serviceName);
    const servicePendingPromise = this.pendingPromises.get(serviceName);
    if (!servicePendingAction) {
      const actionPromise = new Promise<boolean>((resolve, reject) => {
        const serviceAction: Action = {
          resolve,
          reject,
          action: ServiceAction.assemble,
        };
        this.pendingActions.set(serviceName, serviceAction);

        const allDependenciesPassed = this.assembleDependencies(
          service,
          serviceAction,
        );

        if (allDependenciesPassed) {
          resolve(this.executeServiceAction(service, ServiceAction.assemble));
        }
      });
      this.pendingPromises.set(serviceName, actionPromise);
      return actionPromise;
    } else if (servicePendingAction.action !== ServiceAction.assemble) {
      // A pending 'start' or 'stop' means the service is already past 'raw'
      // state, so it has already been assembled.
      this.logger.debug(
        `service [${serviceName}] is already assembled since it's pending [${servicePendingAction.action}] action`,
      );
      return Promise.resolve(true);
    } else {
      // Reprocess current pending assemble action.
      this.logger.debug(`service [${serviceName}] is already pending assemble`);

      const allDependenciesPassed = this.assembleDependencies(
        service,
        servicePendingAction,
      );

      if (allDependenciesPassed) {
        return this.executeServiceAction(service, ServiceAction.assemble);
      } else {
        return servicePendingPromise!;
      }
    }
  };

  /**
   * starts a service and it's dependencies
   * @serviceName
   */
  start = (serviceName: string): Promise<boolean> => {
    this.logger.debug(`request to start [${serviceName}] in service manager`);
    // get service, throw exception if does not exist
    const service = this.getService(serviceName);

    // A 'raw' service has never been initialized. Initialize it first so that
    // the pending 'start' action is not registered until the service is at
    // least 'dormant'. Registering 'start' while still 'raw' would cause any
    // subsequent call to `assemble(this service)` (e.g. from a circular
    // dependency's assembleDependencies) to short-circuit and return true
    // prematurely, because it sees the pending 'start' and assumes the service
    // is already assembled.
    if (service.getStatus() === ServiceStatus.raw) {
      this.logger.debug(
        `Service [${serviceName}] is still raw, activating assemble action`,
      );
      return this.assemble(serviceName).then((initRes) => {
        if (!initRes) {
          this.logger.debug(
            `Service [${serviceName}] failed to assemble before start`,
          );
          return false;
        }
        this.logger.debug(
          `Service [${serviceName}] is now assembled, activating start action`,
        );
        return this.start(serviceName);
      });
    }

    // check if service has any pending action
    const servicePendingAction = this.pendingActions.get(serviceName);
    const servicePendingPromise = this.pendingPromises.get(serviceName);
    if (!servicePendingAction) {
      // no pending action, setup a new one
      const actionPromise = new Promise<boolean>((resolve, reject) => {
        const serviceAction: Action = {
          resolve: resolve,
          reject: reject,
          action: ServiceAction.start,
        };
        this.pendingActions.set(serviceName, serviceAction);

        // if any dependencies is not ready, set pending action
        const allDependenciesPassed = this.startDependencies(
          service,
          serviceAction,
        );

        // if all dependencies are ready, do action
        if (allDependenciesPassed) {
          resolve(this.executeServiceAction(service, ServiceAction.start));
        }
      });
      this.pendingPromises.set(serviceName, actionPromise);
      return actionPromise;
    } else if (servicePendingAction.action !== ServiceAction.start) {
      // service has another action, so throw Error
      throw Error(
        `Invalid action: There is already 'stop' action request for service [${serviceName}]`,
      );
    } else {
      // reprocess current pending action
      this.logger.debug(`service [${serviceName}] is already pending start`);

      // if any dependencies is not ready, set pending action
      const allDependenciesPassed = this.startDependencies(
        service,
        servicePendingAction,
      );

      // if all dependencies are ready, do action
      if (allDependenciesPassed) {
        return this.executeServiceAction(service, ServiceAction.start);
      } else {
        return servicePendingPromise!;
      }
    }
  };

  /**
   * stops a service and it's dependants (also removes service from on-watch list)
   * @serviceName
   */
  stop = (serviceName: string): Promise<boolean> => {
    this.logger.debug(`request to stop [${serviceName}] in service manager`);
    this.removeFromWatch(serviceName);
    // get service, throw exception if does not exist
    const service = this.getService(serviceName);

    // check if service has any pending action
    const servicePendingAction = this.pendingActions.get(serviceName);
    const servicePendingPromise = this.pendingPromises.get(serviceName);
    if (!servicePendingAction) {
      // no pending action, setup a new one
      const actionPromise = new Promise<boolean>((resolve, reject) => {
        const serviceAction: Action = {
          resolve: resolve,
          reject: reject,
          action: ServiceAction.stop,
        };
        this.pendingActions.set(serviceName, serviceAction);

        // if any dependencies is not ready, set pending action
        const allDependenciesPassed = this.stopDependants(
          service,
          serviceAction,
        );

        // if all dependencies are ready, do action
        if (allDependenciesPassed) {
          resolve(this.executeServiceAction(service, ServiceAction.stop));
        }
      });
      this.pendingPromises.set(serviceName, actionPromise);
      return actionPromise;
    } else if (servicePendingAction.action !== ServiceAction.stop) {
      // service has another action, so throw Error
      throw Error(
        `Invalid action: There is already 'start' action request for service [${serviceName}]`,
      );
    } else {
      // reprocess current pending action
      this.logger.debug(`service [${serviceName}] is already pending stop`);

      // if any dependencies is not ready, set pending action
      const allDependenciesPassed = this.stopDependants(
        service,
        servicePendingAction,
      );

      // if all dependencies are ready, do action
      if (allDependenciesPassed) {
        return this.executeServiceAction(service, ServiceAction.stop);
      } else {
        return servicePendingPromise!;
      }
    }
  };

  /**
   * adds a service to on-watch list (which restarts service on interval if fails)
   * @serviceName
   */
  watch = (serviceName: string): void => {
    if (!this.onWatchServices.find((s) => s === serviceName)) {
      this.getService(serviceName);
      this.onWatchServices.push(serviceName);
      this.logger.debug(`service [${serviceName}] is added to on-watch list`);
    }
  };

  /**
   * removes a service from on-watch list
   * @serviceName
   */
  removeFromWatch = (serviceName: string): void => {
    const serviceIndex = this.onWatchServices.findIndex(
      (s) => s === serviceName,
    );
    if (serviceIndex !== -1) {
      this.onWatchServices.splice(serviceIndex, 1);
      this.logger.debug(
        `service [${serviceName}] is removed from on-watch list`,
      );
    }
  };

  /**
   * gets service status
   * @serviceName
   */
  getStatus = (serviceName: string): ServiceStatus =>
    this.getService(serviceName).getStatus();

  /**
   * executes service manager jobs
   */
  executeJobs = async (): Promise<void> => {
    this.logger.debug(`Executing service manager jobs`);
    await this.retryPendingActions();
    await this.restartFailedServices();
    this.logger.debug(`Service manager jobs are executed`);
  };

  /**
   * retries every action on pending list
   */
  protected retryPendingActions = async (): Promise<void> => {
    this.pendingActions.forEach(
      (pendingAction: Action, serviceName: string) => {
        const service = this.getService(serviceName);

        let allDependenciesPassed: boolean;
        if (pendingAction.action === ServiceAction.assemble) {
          allDependenciesPassed = this.assembleDependencies(
            service,
            pendingAction,
          );
        } else if (pendingAction.action === ServiceAction.start) {
          allDependenciesPassed = this.startDependencies(
            service,
            pendingAction,
          );
        } else {
          allDependenciesPassed = this.stopDependants(service, pendingAction);
        }

        if (allDependenciesPassed) {
          this.executeServiceAction(service, pendingAction.action);
        }
      },
    );
  };

  /**
   * restarts every dormant services in on-watch list
   */
  protected restartFailedServices = async (): Promise<void> => {
    this.onWatchServices.forEach((serviceName) => {
      const service = this.getService(serviceName);
      if (service.getStatus() === ServiceStatus.dormant)
        this.start(serviceName);
    });
  };

  /**
   * gets all dependants of a service
   * @serviceName
   */
  protected getServiceDependants = (serviceName: string): Array<Dependency> => {
    const dependants: Array<Dependency> = [];
    this.services.forEach((service, name) => {
      service.getDependencies().forEach((dependency) => {
        if (dependency.serviceName === serviceName)
          dependants.push({
            serviceName: name,
            allowedStatuses: dependency.allowedStatuses,
            action: dependency.action,
          });
      });
    });
    return dependants;
  };

  /**
   * gets service object, throws error if service does not exist on map
   * @param serviceName
   * @returns
   */
  protected getService = (serviceName: string): AbstractService => {
    const service = this.services.get(serviceName);
    if (!service) throw Error(`Service [${serviceName}] is not registered`);
    return service;
  };

  /**
   * deletes pending both action and promise from corresponding maps
   * @param serviceName
   */
  protected deletePendingAction = (serviceName: string): void => {
    this.pendingActions.delete(serviceName);
    this.pendingPromises.delete(serviceName);
  };

  /**
   * assembles service assemble-typed dependencies, returns true if all are ready
   * @param service
   * @param action
   * @returns
   */
  protected assembleDependencies = (
    service: AbstractService,
    action: Action,
  ): boolean => {
    const serviceName = service.getName();
    this.logger.debug(`assembling dependencies of [${serviceName}]`);
    let allDependenciesPassed = true;
    service
      .getDependencies()
      .filter((dep) => dep.action === ServiceAction.assemble)
      .forEach((dependency) => {
        const serviceDependency = this.getService(dependency.serviceName);

        if (
          !dependency.allowedStatuses.includes(serviceDependency.getStatus())
        ) {
          allDependenciesPassed = false;
          this.assemble(dependency.serviceName)
            .then((res) => {
              if (res === false) {
                this.deletePendingAction(serviceName);
                action.resolve(false);
              }
            })
            .catch(action.reject);
        }
      });

    return allDependenciesPassed;
  };

  /**
   * starts service dependencies, returns true if all are ready.
   * Dispatches to assemble() or start() based on each dependency's action.
   * @param service
   * @param action
   * @returns
   */
  protected startDependencies = (
    service: AbstractService,
    action: Action,
  ): boolean => {
    const serviceName = service.getName();
    this.logger.debug(`starting dependencies of [${serviceName}]`);
    let allDependenciesPassed = true;
    service.getDependencies().forEach((dependency) => {
      const serviceDependency = this.getService(dependency.serviceName);

      if (!dependency.allowedStatuses.includes(serviceDependency.getStatus())) {
        allDependenciesPassed = false;
        const depPromise =
          dependency.action === ServiceAction.assemble
            ? this.assemble(dependency.serviceName)
            : this.start(dependency.serviceName);
        depPromise
          .then((res) => {
            if (res === false) {
              this.deletePendingAction(serviceName);
              action.resolve(false);
            }
          })
          .catch(action.reject);
      }
    });

    return allDependenciesPassed;
  };

  /**
   * stops service start-typed dependants, returns true if all are stopped.
   * Only 'start'-action dependants are stopped – services that merely had an
   * 'assemble' dependency don't need to stop when their dep goes dormant.
   * @param service
   * @param action
   * @returns
   */
  protected stopDependants = (
    service: AbstractService,
    action: Action,
  ): boolean => {
    const serviceName = service.getName();
    this.logger.debug(`stopping dependants of [${serviceName}]`);
    let allDependenciesPassed = true;
    this.getServiceDependants(serviceName)
      .filter((dependant) => dependant.action === ServiceAction.start)
      .forEach((dependant) => {
        const serviceDependency = this.getService(dependant.serviceName);

        if (serviceDependency.getStatus() !== ServiceStatus.dormant) {
          allDependenciesPassed = false;
          this.stop(dependant.serviceName)
            .then((res) => {
              if (res === false) {
                this.deletePendingAction(serviceName);
                action.resolve(false);
              }
            })
            .catch(action.reject);
        }
      });

    return allDependenciesPassed;
  };

  /**
   * assembles, starts, or stops a service
   * @param service
   * @param action
   * @returns
   */
  protected executeServiceAction = async (
    service: AbstractService,
    action: ServiceAction,
  ): Promise<boolean> => {
    const serviceName = service.getName();

    if (action === ServiceAction.assemble) {
      return service.assembleService().then((res) => {
        if (res === false) {
          this.logger.debug(`Service [${serviceName}] failed to assemble`);
        } else {
          this.logger.debug(`Service [${serviceName}] is assembled`);
        }
        this.deletePendingAction(serviceName);
        return res;
      });
    } else if (action === ServiceAction.start) {
      return service.startService().then((res) => {
        if (res === false) {
          this.logger.debug(`Service [${serviceName}] failed to start`);
        } else {
          this.logger.debug(`Service [${serviceName}] is up`);
        }
        this.deletePendingAction(serviceName);
        return res;
      });
    } else {
      return service.stopService().then((res) => {
        if (res === false) {
          this.logger.debug(`Service [${serviceName}] failed to stop`);
        } else {
          this.logger.debug(`Service [${serviceName}] is down`);
        }
        this.deletePendingAction(serviceName);
        return res;
      });
    }
  };
}
