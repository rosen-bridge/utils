import { Semaphore } from 'await-semaphore';
import {
  ActionPromise,
  Dependency,
  ServiceAction,
  ServiceStatus,
} from './types';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';

export type StatusChangeCallbackFunction = (
  service: AbstractService,
  previousStatus: ServiceStatus,
  newStatus: ServiceStatus
) => unknown;

export abstract class AbstractService {
  protected abstract readonly name: string;
  protected abstract readonly dependencies: Array<Dependency>;
  private status: ServiceStatus;
  protected callbacks: Array<StatusChangeCallbackFunction> = [];
  protected actionSemaphore = new Semaphore(1);
  protected actionPromise: ActionPromise | undefined;
  protected logger: AbstractLogger;

  constructor(logger?: AbstractLogger) {
    this.status = ServiceStatus.dormant;
    this.logger = logger ?? new DummyLogger();
  }

  /**
   * sets status change callback (a function to
   *  alert ServiceManager about changing status
   *  of the service)
   * @param serviceManagerCallback
   */
  addCallback = (
    serviceManagerCallback: StatusChangeCallbackFunction
  ): void => {
    this.callbacks.push(serviceManagerCallback);
  };

  /**
   * returns service name (should be unique)
   */
  getName = (): string => this.name;

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
    const previousStatus = this.status;
    this.status = status;
    this.logger.info(
      `Service [${this.getName()}] status changed from [${previousStatus}] to [${status}]`
    );
    this.callbacks.forEach((callback) =>
      callback(this, previousStatus, status)
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
          `there is already an active request to start service [${this.getName()}]`
        );
        return this.actionPromise.promise;
      } else
        throw Error(`Cannot start service [${this.name}]: Service is stopping`);
    }
    return this.actionSemaphore.acquire().then((release) => {
      if (this.getStatus() !== ServiceStatus.dormant) {
        this.logger.debug(
          `service [${this.getName()}] is already in [${this.getStatus()}] status`
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
          this.logger.debug(`service [${this.getName()}] is started`);
          this.actionPromise = undefined;
          release();
          return res;
        })
        .catch((error) => {
          this.logger.warn(
            `An error occurred while starting service [${this.name}]: ${error}`
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
        `there is already an active request to stop service [${this.getName()}]`
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
          this.logger.debug(`service [${this.getName()}] is stopped`);
          this.actionPromise = undefined;
          release();
          return res;
        })
        .catch((error) => {
          this.logger.warn(
            `An error occurred while stopping service [${this.name}]: ${error}`
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
}
