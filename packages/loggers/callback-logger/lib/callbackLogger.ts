import { AbstractLogger } from '@rosen-bridge/abstract-logger';

export class CallbackLogger extends AbstractLogger {
  constructor(
    protected logger: AbstractLogger,

    protected callback: (
      level: keyof AbstractLogger,

      message: string,

      context?: unknown,
    ) => unknown,
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
    } catch {
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
