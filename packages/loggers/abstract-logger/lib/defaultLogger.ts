import { AbstractLogger } from './abstractLogger';

/**
 * A singleton logger wrapper that delegates to an underlying logger implementation.
 * Must be initialized with a logger instance before use.
 */
export class DefaultLogger extends AbstractLogger {
  protected static instance: AbstractLogger;

  /**
   * Creates a new DefaultLogger instance.
   * @param logger - The underlying logger to delegate to
   */
  protected constructor(protected logger: AbstractLogger) {
    super();
  }

  /**
   * Initializes the DefaultLogger singleton with a logger implementation.
   * @param logger - The logger instance to use for all logging operations
   */
  static init(logger: AbstractLogger): void {
    this.instance = new DefaultLogger(logger);
  }

  /**
   * Gets the singleton instance of DefaultLogger.
   * @returns The DefaultLogger instance
   * @throws Error if init() has not been called
   */
  static getInstance = () => {
    if (!this.instance)
      throw new Error(
        'You should call `DefaultLogger.init` before calling `DefaultLogger.getInstance`',
      );
    return this.instance;
  };

  /**
   * Logs a trace-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  trace = (message: string, context?: unknown) => {
    this.logger.trace(message, context);
  };

  /**
   * Logs a debug-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  debug = (message: string, context?: unknown) => {
    this.logger.debug(message, context);
  };

  /**
   * Logs an info-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  info = (message: string, context?: unknown) => {
    this.logger.info(message, context);
  };

  /**
   * Logs a warning-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  warn = (message: string, context?: unknown) => {
    this.logger.warn(message, context);
  };

  /**
   * Logs an error-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  error = (message: string, context?: unknown) => {
    this.logger.error(message, context);
  };

  /**
   * Logs a critical-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  critical = (message: string, context?: unknown) => {
    this.logger.critical(message, context);
  };

  /**
   * Creates a child logger with a specified path prefix.
   * @param path - The path to append to the logger's context
   * @returns A new AbstractLogger instance with the specified path
   */
  child = (path: string) => {
    return this.logger.child(path);
  };
}
