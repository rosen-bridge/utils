import { FastifyBaseLogger, LogLevel } from 'fastify';
import { serializers } from 'fastify/lib/logger-pino.js';

import { AbstractLogger } from '@rosen-bridge/abstract-logger';

export class FastifyLogger implements FastifyBaseLogger {
  /**
   * creates a new instance
   *
   * @param logger - the underlying logger to delegate to
   * @param level - for FastifyBaseLogger interface compliance
   */
  constructor(
    protected logger: AbstractLogger,
    public level: LogLevel = 'info',
  ) {}

  /**
   * no-op silent logger method (for Pino interface compliance)
   * logs nothing regardless of input
   */
  silent = () => {
    // No-op
  };

  /**
   * logs a trace-level message
   *
   * @param obj: object to be serialized
   * @param msg: the log message to write
   */
  trace = (...args: unknown[]) => {
    const { message, ...context } = this.parseArgs(...args);
    this.logger.trace(message as string, context);
  };

  /**
   * logs a debug-level message
   *
   * @param obj: object to be serialized
   * @param msg: the log message to write
   */
  debug = (...args: unknown[]) => {
    const { message, ...context } = this.parseArgs(...args);
    this.logger.debug(message as string, context);
  };

  /**
   * logs an info-level message
   *
   * @param obj: object to be serialized
   * @param msg: the log message to write
   */
  info = (...args: unknown[]) => {
    const { message, ...context } = this.parseArgs(...args);
    this.logger.info(message as string, context);
  };

  /**
   * logs a warning-level message
   *
   * @param obj: object to be serialized
   * @param msg: the log message to write
   */
  warn = (...args: unknown[]) => {
    const { message, ...context } = this.parseArgs(...args);
    this.logger.warn(message as string, context);
  };

  /**
   * logs an error-level message
   *
   * @param obj: object to be serialized
   * @param msg: the log message to write
   */
  error = (...args: unknown[]) => {
    const { message, ...context } = this.parseArgs(...args);
    this.logger.error(message as string, context);
  };

  /**
   * logs a critical/fatal-level message
   *
   * @param obj: object to be serialized
   * @param msg: the log message to write
   */
  fatal = (...args: unknown[]) => {
    const { message, ...context } = this.parseArgs(...args);
    this.logger.critical(message as string, context);
  };

  /**
   * creates a child logger with bindings and optional configuration
   * conforms to the Pino/Fastify logger interface
   *
   * @param bindings - Key-value pairs to attach to all logs from the child logger
   * @returns A new FastifyBaseLogger instance (child logger)
   */
  child = (bindings: Record<string, unknown>): FastifyBaseLogger => {
    if (Object.keys(bindings).length === 0) return this;

    const childLogger = this.logger.child(JSON.stringify(bindings));
    return new FastifyLogger(childLogger, this.level);
  };

  /**
   * utility function to map and serialize the arguments of fastify logger functions
   */
  private parseArgs = (...args: unknown[]): Record<string, unknown> => {
    const [arg0, arg1] = args;

    let info: Record<string, unknown> = {};

    if (typeof arg0 === 'string') {
      // format: message [...splat]
      info.message = arg0;
    } else {
      // format: meta [message] [...splat]
      info = (arg0 ?? {}) as Record<string, unknown>;

      if (arg0 instanceof Error) info = { err: arg0, message: arg0.message };

      // serialize fastify req, res, err
      for (const key in info) {
        if (serializers[key]) info[key] = serializers[key](info[key]);
      }

      if (arg1) info.message = arg1;
    }

    return info;
  };
}
