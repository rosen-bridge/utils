import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { LogCallback, LogLevel } from './types';

/**
 * Singleton manager for log callbacks.
 * Stores and executes callbacks registered for different log levels.
 */
class CallbackManager {
  protected callbacks: Map<string, Array<LogCallback>> = new Map();
  private static instance: CallbackManager;

  protected constructor() {}

  /**
   * Gets the singleton instance of CallbackManager.
   * @returns The CallbackManager instance
   */
  static getInstance = () => {
    if (!this.instance) {
      this.instance = new CallbackManager();
    }
    return this.instance;
  };

  /**
   * Executes all registered callbacks for a specific log level.
   * @param level - The log level to trigger callbacks for
   * @param message - The log message to pass to callbacks
   * @param context - Optional additional context to pass to callbacks
   */
  callback = (level: LogLevel, message: string, context?: unknown) => {
    const callbacks = this.callbacks.get(level);
    if (callbacks) {
      for (const callback of callbacks) {
        callback(message, context);
      }
    }
  };

  /**
   * Registers a callback function for a specific log level.
   * @param level - The log level to register the callback for
   * @param callback - The callback function to execute when logging at this level
   */
  registerCallback = (level: keyof AbstractLogger, callback: LogCallback) => {
    const levelCallbacks =
      this.callbacks.get(level) ?? ([] as Array<LogCallback>);
    levelCallbacks.push(callback);
    this.callbacks.set(level, levelCallbacks);
  };
}

/**
 * A logger wrapper that supports registering callbacks for log events.
 * Delegates actual logging to an underlying logger while also triggering registered callbacks.
 */
export class CallbackLogger extends AbstractLogger {
  /**
   * Creates a new CallbackLogger instance.
   * @param logger - The underlying logger to delegate logging to
   */
  constructor(protected logger: AbstractLogger) {
    super();
  }

  /**
   * Registers a callback function for a specific log level.
   * @param level - The log level to register the callback for
   * @param callback - The callback function to execute when logging at this level
   */
  registerCallback = (level: LogLevel, callback: LogCallback): void => {
    CallbackManager.getInstance().registerCallback(level, callback);
  };

  /**
   * Creates a child logger with a specified path prefix.
   * @param path - The path to append to the logger's context
   * @returns A new AbstractLogger instance with the specified path
   */
  child = (path: string) => {
    return this.logger.child(path);
  };

  /**
   * Logs a message at the specified level, triggering callbacks and delegating to the underlying logger.
   * @param level - The log level
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  log = (level: keyof AbstractLogger, message: string, context?: unknown) => {
    try {
      CallbackManager.getInstance().callback(level, message, context);
    } catch {
      this.logger.warn('Can not execute callback function for log');
    }
    this.logger[level](message, context);
  };

  /**
   * Logs a trace-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  trace = (message: string, context?: unknown) =>
    this.log('trace', message, context);

  /**
   * Logs a debug-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  debug = (message: string, context?: unknown) =>
    this.log('debug', message, context);

  /**
   * Logs an info-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  info = (message: string, context?: unknown) =>
    this.log('info', message, context);

  /**
   * Logs a warning-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  warn = (message: string, context?: unknown) =>
    this.log('warn', message, context);

  /**
   * Logs an error-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  error = (message: string, context?: unknown) =>
    this.log('error', message, context);

  /**
   * Logs a critical-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  critical = (message: string, context?: unknown) =>
    this.log('critical', message, context);
}
