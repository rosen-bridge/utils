import { AbstractService } from './AbstractService';
import { Action, Dependency, ServiceAction, ServiceStatus } from './types';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';

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
    newStatus: ServiceStatus
  ): void => {
    this.getServiceDependants(service.getName()).forEach((dependant) => {
      if (newStatus === ServiceStatus.dormant) {
        this.getService(dependant.serviceName).stopService();
      } else {
        const dependantsPending = this.pendingActions.get(
          dependant.serviceName
        );
        if (
          dependantsPending &&
          dependantsPending.action === ServiceAction.start
        ) {
          const dependenciesNotPassed = this.getService(dependant.serviceName)
            .getDependencies()
            .some(
              (dependency) =>
                !dependency.allowedStatuses.includes(
                  this.getService(dependency.serviceName).getStatus()
                )
            );
          if (!dependenciesNotPassed) {
            this.start(dependant.serviceName)
              .then(dependantsPending.resolve)
              .catch(dependantsPending.reject);
          }
        }
      }
    });

    if (newStatus === ServiceStatus.dormant) {
      service.getDependencies().forEach((dependency) => {
        const dependencyPending = this.pendingActions.get(
          dependency.serviceName
        );
        if (
          dependencyPending &&
          dependencyPending.action === ServiceAction.stop
        ) {
          const dependenciesNotPassed = this.getServiceDependants(
            dependency.serviceName
          ).some(
            (dependency) =>
              this.getService(dependency.serviceName).getStatus() !==
              ServiceStatus.dormant
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
    this.services.set(service.getName(), service);
    service.addCallback(this.callbackHandler);
  };

  /**
   * starts a service and it's dependencies
   * @serviceName
   */
  start = (serviceName: string): Promise<boolean> => {
    this.logger.debug(`request to start [${serviceName}] in service manager`);
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
          action: ServiceAction.start,
        };
        this.pendingActions.set(serviceName, serviceAction);

        // if any dependencies is not ready, set pending action
        const allDependenciesPassed = this.startDependencies(
          service,
          serviceAction
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
        `Invalid action: There is already 'stop' action request for service [${serviceName}]`
      );
    } else {
      // reprocess current pending action
      this.logger.debug(`service [${serviceName}] is already pending start`);

      // if any dependencies is not ready, set pending action
      const allDependenciesPassed = this.startDependencies(
        service,
        servicePendingAction
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
          serviceAction
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
        `Invalid action: There is already 'start' action request for service [${serviceName}]`
      );
    } else {
      // reprocess current pending action
      this.logger.debug(`service [${serviceName}] is already pending stop`);

      // if any dependencies is not ready, set pending action
      const allDependenciesPassed = this.stopDependants(
        service,
        servicePendingAction
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
      (s) => s === serviceName
    );
    if (serviceIndex !== -1) {
      this.onWatchServices.splice(serviceIndex, 1);
      this.logger.debug(
        `service [${serviceName}] is removed from on-watch list`
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

        // if any dependencies is not ready, set pending action
        const allDependenciesPassed =
          pendingAction.action === ServiceAction.start
            ? this.startDependencies(service, pendingAction)
            : this.stopDependants(service, pendingAction);

        // if all dependencies are ready, do action
        if (allDependenciesPassed) {
          this.executeServiceAction(service, ServiceAction.start);
        }
      }
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
   * starts service dependencies, returns true if all are ready
   * @param service
   * @param action
   * @returns
   */
  protected startDependencies = (
    service: AbstractService,
    action: Action
  ): boolean => {
    const serviceName = service.getName();
    this.logger.debug(`starting dependencies of [${serviceName}]`);
    // if any dependencies is not ready, set pending action
    let allDependenciesPassed = true;
    service.getDependencies().forEach((dependency) => {
      const serviceDependency = this.getService(dependency.serviceName);

      if (!dependency.allowedStatuses.includes(serviceDependency.getStatus())) {
        allDependenciesPassed = false;
        this.start(dependency.serviceName)
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
   * stops service dependants, returns true if all are stopped
   * @param service
   * @param action
   * @returns
   */
  protected stopDependants = (
    service: AbstractService,
    action: Action
  ): boolean => {
    const serviceName = service.getName();
    this.logger.debug(`stopping dependants of [${serviceName}]`);
    // if any dependencies is not ready, set pending action
    let allDependenciesPassed = true;
    this.getServiceDependants(serviceName).forEach((dependant) => {
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
   * starts or stops a service
   * @param service
   * @param action
   * @returns
   */
  protected executeServiceAction = async (
    service: AbstractService,
    action: ServiceAction
  ): Promise<boolean> => {
    const serviceName = service.getName();

    if (action === ServiceAction.start) {
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
