import { AbstractLogger } from './abstractLogger';

/**
 * A logger implementation that outputs to the console.
 * Uses native console methods for different log levels.
 */
export class ConsoleLogger extends AbstractLogger {
  /**
   * Creates a new ConsoleLogger instance.
   * @param prefix - The prefix to include in all log messages
   */
  constructor(protected prefix: string) {
    super();
  }

  /**
   * Creates a child logger with an appended path prefix.
   * @param path - The path to append to the current prefix
   * @returns A new ConsoleLogger instance with the combined prefix
   */
  child = (path: string) => new ConsoleLogger(`${this.prefix}-${path}`);

  /**
   * Logs a trace-level message to the console.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  trace = (message: string, context?: unknown) =>
    console.trace(`TRACE: [${this.prefix}] ${message}`, context);

  /**
   * Logs a debug-level message to the console.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  debug = (message: string, context?: unknown) =>
    console.debug(`DEBUG: [${this.prefix}] ${message}`, context);

  /**
   * Logs an info-level message to the console.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  info = (message: string, context?: unknown) =>
    console.info(`INFO: [${this.prefix}] ${message}`, context);

  /**
   * Logs a warning-level message to the console.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  warn = (message: string, context?: unknown) =>
    console.warn(`WARN: [${this.prefix}] ${message}`, context);

  /**
   * Logs an error-level message to the console.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  error = (message: string, context?: unknown) =>
    console.error(`ERROR: [${this.prefix}] ${message}`, context);

  /**
   * Logs a critical-level message to the console.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  critical = (message: string, context?: unknown) =>
    console.error(`CRITICAL: [${this.prefix}] ${message}`, context);
}
