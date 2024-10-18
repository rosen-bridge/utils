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
  protected loggerCallbacks: Map<string, LogCallback> | undefined;

  constructor(protected instance: AbstractLoggerFactory) {
    super();
  }

  registerCallback = (level: keyof AbstractLogger, callback: LogCallback) => {
    const levelCallbacks =
      this.callbacks.get(level) ?? ([] as Array<LogCallback>);
    levelCallbacks.push(callback);
    this.callbacks.set(level, levelCallbacks);
  };

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

  getLogger = (filePath: string) => {
    const logger = this.instance.getLogger(filePath);
    return new ReplicatedLogger(logger, this.callback);
  };
}
