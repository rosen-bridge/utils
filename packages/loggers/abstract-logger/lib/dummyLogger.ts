import { AbstractLogger } from './abstractLogger';

/**
 * A no-op logger implementation that discards all log messages.
 * Useful for testing or when logging should be disabled.
 */
export class DummyLogger extends AbstractLogger {
  /**
   * No-op trace logging method.
   */
  trace = () => undefined;

  /**
   * No-op critical logging method.
   */
  critical = () => undefined;

  /**
   * Returns the same DummyLogger instance.
   * @returns The same DummyLogger instance
   */
  child = () => this;

  /**
   * No-op debug logging method.
   */
  debug = () => undefined;

  /**
   * No-op error logging method.
   */
  error = () => undefined;

  /**
   * No-op info logging method.
   */
  info = () => undefined;

  /**
   * No-op warning logging method.
   */
  warn = () => undefined;
}
