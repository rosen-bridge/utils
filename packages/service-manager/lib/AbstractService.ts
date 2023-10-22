import { Semaphore } from 'await-semaphore';
import {
  ActionPromise,
  Dependency,
  ServiceAction,
  ServiceStatus,
  StatusChangeCallbackFunction,
} from './types';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';

export abstract class AbstractService {
  protected abstract readonly name: string;
  protected abstract readonly dependencies: Array<Dependency>;
  private status: ServiceStatus;
  protected callbacks: Array<StatusChangeCallbackFunction> = [];
  protected actionSemaphore = new Semaphore(1);
  protected actionPromise: ActionPromise | undefined;
  protected logger: AbstractLogger;

  constructor(initialStatus: ServiceStatus, logger?: AbstractLogger) {
    this.status = initialStatus;
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
    this.callbacks.forEach((callback) =>
      callback(this.name, previousStatus, status)
    );
  };

  /**
   * starts the service, if service is starting returns current active promise
   */
  startService = async (): Promise<boolean> => {
    if (this.actionPromise) {
      if (this.actionPromise.action === ServiceAction.start)
        return this.actionPromise.promise;
      else
        throw Error(`Cannot start service [${this.name}]: Service is stopping`);
    }
    return this.actionSemaphore.acquire().then((release) => {
      if (this.getStatus() !== ServiceStatus.dormant) {
        release();
        return true;
      }
      this.actionPromise = {
        action: ServiceAction.start,
        promise: this.start(),
      };
      return this.actionPromise.promise
        .then((res) => {
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
   */
  protected abstract start: () => Promise<boolean>;

  /**
   * stops the service, if service is stopping returns current active promise
   */
  stopService = async (): Promise<boolean> => {
    if (this.actionPromise && this.actionPromise.action === ServiceAction.stop)
      return this.actionPromise.promise;

    return this.actionSemaphore.acquire().then((release) => {
      if (this.getStatus() === ServiceStatus.dormant) {
        release();
        return true;
      }
      this.actionPromise = {
        action: ServiceAction.stop,
        promise: this.stop(),
      };
      return this.actionPromise.promise
        .then((res) => {
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
   */
  protected abstract stop: () => Promise<boolean>;
}
