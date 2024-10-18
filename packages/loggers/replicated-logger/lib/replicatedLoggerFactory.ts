import {
  AbstractLogger,
  AbstractLoggerFactory,
} from '@rosen-bridge/abstract-logger';
import { LogCallback } from './types';

class ReplicatedLogger extends AbstractLogger {
  constructor(
    protected logger: AbstractLogger,
    protected callback: (
      level: keyof AbstractLogger,
      message: string,
      context?: unknown
    ) => unknown
  ) {
    super();
  }

  /**
   * new log for all log levels
   * @param level
   * @param message
   * @param context
   */
  log = (level: keyof AbstractLogger, message: string, context?: unknown) => {
    try {
      this.callback(level, message, context);
    } catch (e) {
      this.logger.warn('Can not execute callback function for log');
    }
    this.logger[level](message, context);
  };

  debug = (message: string, context?: unknown) => {
    this.log('debug', message, context);
  };

  info = (message: string, context?: unknown) => {
    this.log('info', message, context);
  };

  warn = (message: string, context?: unknown) => {
    this.log('warn', message, context);
  };

  error = (message: string, context?: unknown) => {
    this.log('error', message, context);
  };
}

export class ReplicatedLoggerFactory extends AbstractLoggerFactory {
  protected callbacks: Map<string, Array<LogCallback>> = new Map();
  protected defaultLogger: AbstractLogger | undefined;

  constructor(protected instance: AbstractLoggerFactory) {
    super();
  }

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
      this.defaultLogger = new ReplicatedLogger(
        this.instance.getDefaultLogger(),
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
    const logger = this.instance.getLogger(filePath);
    return new ReplicatedLogger(logger, this.callback);
  };
}
