import {
  AbstractLoggerFactory,
  AbstractLogger,
} from '@rosen-bridge/abstract-logger';
import { CallbackLogger } from './CallbackLogger';
import { LogCallback } from './types';

export class CallbackLoggerFactory extends AbstractLoggerFactory {
  protected callbacks: Map<string, Array<LogCallback>> = new Map();
  protected defaultLogger: AbstractLogger | undefined;

  protected static instance: CallbackLoggerFactory;
  protected constructor(protected loggerFactory: AbstractLoggerFactory) {
    super();
  }

  /**
   * initialize logger factory class
   * @param factoryInstance
   */
  static init(factoryInstance: AbstractLoggerFactory): void {
    this.instance = new CallbackLoggerFactory(factoryInstance);
  }

  /**
   * get instance of the class
   * throws error when the factory is not initialized yet
   */
  static getInstance = () => {
    if (!this.instance)
      throw new Error(
        'You should call `CallbackLoggerFactory.init` before calling `CallbackLoggerFactory.getInstance`'
      );
    return this.instance;
  };

  /**
   * register new callback for specific log level
   * @param level
   * @param callback
   */
  registerCallback = (level: keyof AbstractLogger, callback: LogCallback) => {
    const levelCallbacks =
      this.callbacks.get(level) ?? ([] as Array<LogCallback>);
    levelCallbacks.push(callback);
    this.callbacks.set(level, levelCallbacks);
  };

  /**
   * callback method used in all generated loggers. for each log
   * @param level
   * @param message
   * @param context
   */
  protected callback = (
    level: keyof AbstractLogger,
    message: string,
    context?: unknown
  ) => {
    const callbacks = this.callbacks.get(level);
    if (callbacks) {
      for (const callback of callbacks) {
        callback(message, context);
      }
    }
  };

  /**
   * get default, file-agnostic logger
   */
  getDefaultLogger = () => {
    if (!this.defaultLogger) {
      this.defaultLogger = new CallbackLogger(
        this.loggerFactory.getDefaultLogger(),
        this.callback
      );
    }
    return this.defaultLogger;
  };

  /**
   * get a logger to be used in a specific file located under `filePath`
   *
   * @param filePath
   */
  getLogger = (filePath: string) => {
    const logger = this.loggerFactory.getLogger(filePath);
    return new CallbackLogger(logger, this.callback);
  };
}
