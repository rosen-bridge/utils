/**
 * Callback function type for log events.
 * @param message - The log message
 * @param context - Optional additional context
 */
export type LogCallback = (message: string, context?: unknown) => unknown;

/**
 * A mapping of log levels to their registered callback functions.
 */
export type LogCallbacks = {
  [key: string]: Array<LogCallback>;
};
