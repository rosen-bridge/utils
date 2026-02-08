/**
 * Abstract base class for logging implementations.
 * Provides a common interface for different logging backends.
 */
export abstract class AbstractLogger {
  /**
   * Logs a trace-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  abstract trace: (message: string, context?: unknown) => unknown;

  /**
   * Logs a debug-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  abstract debug: (message: string, context?: unknown) => unknown;

  /**
   * Logs an info-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  abstract info: (message: string, context?: unknown) => unknown;

  /**
   * Logs a warning-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  abstract warn: (message: string, context?: unknown) => unknown;

  /**
   * Logs an error-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  abstract error: (message: string, context?: unknown) => unknown;

  /**
   * Logs a critical-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  abstract critical: (message: string, context?: unknown) => unknown;

  /**
   * Creates a child logger with a specified path prefix.
   * @param path - The path to append to the logger's context
   * @returns A new AbstractLogger instance with the specified path
   */
  abstract child: (path: string) => AbstractLogger;
}
