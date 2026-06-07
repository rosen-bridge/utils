import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { Semaphore } from '@rosen-bridge/semaphore';

import {
  ActionPromise,
  Dependency,
  ServiceAction,
  ServiceStatus,
} from './types';

export type StatusChangeCallbackFunction = (
  service: AbstractService,

  previousStatus: ServiceStatus,

  newStatus: ServiceStatus,
) => unknown;

export abstract class AbstractService {
  static readonly serviceName: string;
  protected abstract readonly dependencies: Array<Dependency>;
  private status: ServiceStatus;
  protected callbacks: Array<StatusChangeCallbackFunction> = [];
  protected actionSemaphore = new Semaphore(1);
  protected actionPromise: ActionPromise | undefined;
  protected logger: AbstractLogger;

  constructor(logger?: AbstractLogger) {
    this.status = ServiceStatus.raw;
    this.logger = logger ?? new DummyLogger();
  }

  /**
   * sets status change callback (a function to
   *  alert ServiceManager about changing status
   *  of the service)
   * @param serviceManagerCallback
   */
  addCallback = (
    serviceManagerCallback: StatusChangeCallbackFunction,
  ): void => {
    this.callbacks.push(serviceManagerCallback);
  };

  /**
   * returns service name (should be unique)
   */
  getName = (): string => {
    const name = (this.constructor as typeof AbstractService).serviceName;
    if (typeof name === 'string') return name;
    throw new Error(`Service name is not defined`);
  };

  /**
   * returns service dependencies
   */
  getDependencies = (): Array<Dependency> => this.dependencies;

  /**
   * returns service status
   */
  getStatus = (): ServiceStatus => this.status;

  /**
   * sets service status
   */
  protected setStatus = (status: ServiceStatus): void => {
    if (status === ServiceStatus.raw)
      throw Error(`Cannot change service status back to "raw"`);
    const previousStatus = this.status;
    this.status = status;
    this.logger.info(
      `Service [${this.getName()}] status changed from [${previousStatus}] to [${status}]`,
    );
    this.callbacks.forEach((callback) =>
      callback(this, previousStatus, status),
    );
  };

  /**
   * starts the service, if service is starting returns current active promise
   * @returns true if service started successfully, otherwise false
   */
  startService = async (): Promise<boolean> => {
    this.logger.debug(`request to start [${this.getName()}]`);
    if (this.actionPromise) {
      if (this.actionPromise.action === ServiceAction.start) {
        this.logger.debug(
          `there is already an active request to start service [${this.getName()}]`,
        );
        return this.actionPromise.promise;
      } else
        throw Error(
          `Cannot start service [${this.getName()}]: Service is stopping`,
        );
    }
    return this.actionSemaphore.acquire().then((release) => {
      if (this.getStatus() !== ServiceStatus.dormant) {
        this.logger.debug(
          `service [${this.getName()}] is already in [${this.getStatus()}] status`,
        );
        release();
        return true;
      }
      this.logger.debug(`starting service [${this.getName()}]`);
      this.actionPromise = {
        action: ServiceAction.start,
        promise: this.start(),
      };
      return this.actionPromise.promise
        .then((res) => {
          if (res) this.logger.debug(`service [${this.getName()}] is started`);
          else this.logger.debug(`service [${this.getName()}] failed to start`);
          this.actionPromise = undefined;
          release();
          return res;
        })
        .catch((error) => {
          this.logger.warn(
            `An error occurred while starting service [${this.getName()}]: ${error}`,
          );
          release();
          return false;
        });
    });
  };

  /**
   * starts the service
   * @returns true if service started successfully, otherwise false
   */
  protected abstract start: () => Promise<boolean>;

  /**
   * stops the service, if service is stopping returns current active promise
   * @returns true if service stopped successfully, otherwise false
   */
  stopService = async (): Promise<boolean> => {
    this.logger.debug(`request to stop [${this.getName()}]`);
    if (
      this.actionPromise &&
      this.actionPromise.action === ServiceAction.stop
    ) {
      this.logger.debug(
        `there is already an active request to stop service [${this.getName()}]`,
      );
      return this.actionPromise.promise;
    }

    return this.actionSemaphore.acquire().then((release) => {
      if (this.getStatus() === ServiceStatus.dormant) {
        this.logger.debug(`service [${this.getName()}] is already dormant`);
        release();
        return true;
      }
      this.logger.debug(`stopping service [${this.getName()}]`);
      this.actionPromise = {
        action: ServiceAction.stop,
        promise: this.stop(),
      };
      return this.actionPromise.promise
        .then((res) => {
          if (res) this.logger.debug(`service [${this.getName()}] is stopped`);
          else this.logger.debug(`service [${this.getName()}] failed to stop`);
          this.actionPromise = undefined;
          release();
          return res;
        })
        .catch((error) => {
          this.logger.warn(
            `An error occurred while stopping service [${this.getName()}]: ${error}`,
          );
          release();
          return false;
        });
    });
  };

  /**
   * stops the service
   * @returns true if service stopped successfully, otherwise false
   */
  protected abstract stop: () => Promise<boolean>;

  /**
   * assembles the service, if service is assembling returns current active promise
   * @returns true if service assembled successfully, otherwise false
   */
  assembleService = async (): Promise<boolean> => {
    this.logger.debug(`request to assemble [${this.getName()}]`);
    if (this.actionPromise) {
      if (this.actionPromise.action === ServiceAction.assemble) {
        this.logger.debug(
          `there is already an active request to assemble service [${this.getName()}]`,
        );
        return this.actionPromise.promise;
      } else {
        this.logger.debug(
          `service [${this.getName()}] is already assembled since it's pending [${this.actionPromise.action}] action`,
        );
        return true;
      }
    }
    return this.actionSemaphore.acquire().then((release) => {
      const currentStatus = this.getStatus();
      if (currentStatus !== ServiceStatus.raw) {
        this.logger.debug(
          `service [${this.getName()}] is already assembled and in [${currentStatus}] status`,
        );
        release();
        return true;
      }
      this.logger.debug(`assembling service [${this.getName()}]`);
      this.actionPromise = {
        action: ServiceAction.assemble,
        promise: this.assemble(),
      };
      return this.actionPromise.promise
        .then((res) => {
          if (res)
            this.logger.debug(`service [${this.getName()}] is assembled`);
          else
            this.logger.debug(`service [${this.getName()}] failed to assemble`);
          this.actionPromise = undefined;
          release();
          return res;
        })
        .catch((error) => {
          this.logger.warn(
            `An error occurred while assembling service [${this.getName()}]: ${error}`,
          );
          release();
          return false;
        });
    });
  };

  /**
   * assembles the service
   * @returns true if service assembled successfully, otherwise false
   */
  protected abstract assemble: () => Promise<boolean>;
}
