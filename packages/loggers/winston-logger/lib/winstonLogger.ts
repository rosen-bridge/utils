import winston, { format } from 'winston';
import 'winston-daily-rotate-file';
import path from 'node:path';

import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';

import {
  ConsoleTransportOptions,
  FileTransportOptions,
  TransportOptions,
  LogTransports,
  LokiTransportOptions,
  CustomLogger,
  logLevels,
} from './types';

import printf = format.printf;
import LokiTransport from 'winston-loki';

/**
 * Custom log format that includes timestamp, level, filename, message and context.
 */
const logFormat = printf(
  ({ level, message, timestamp, fileName, ...context }) => {
    return `${timestamp} ${level}: ${fileName ? `[${fileName}] ` : ''}${message}${
      context && Object.keys(context).length
        ? ` ${JsonBigInt.stringify(context)}`
        : ''
    }`;
  },
);

/**
 * Factory functions for creating different winston transport types.
 */
const logTransports = {
  /**
   * Creates a console transport for logging to stdout.
   * @param transportOptions - Console transport configuration options
   * @returns A winston Console transport instance
   */
  console: (transportOptions: ConsoleTransportOptions) =>
    new winston.transports.Console({
      format: winston.format.simple(),
      level: transportOptions.level,
    }),

  /**
   * Creates a file transport for logging to rotating daily files.
   * @param transportOptions - File transport configuration options
   * @returns A winston DailyRotateFile transport instance
   */
  file: (transportOptions: FileTransportOptions) =>
    new winston.transports.DailyRotateFile({
      filename: `${transportOptions.path}%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: transportOptions.maxSize,
      maxFiles: transportOptions.maxFiles,
      level: transportOptions.level,
    }),

  /**
   * Creates a Loki transport for sending logs to Grafana Loki.
   * @param transportOptions - Loki transport configuration options
   * @returns A winston Loki transport instance
   */
  loki: (transportOptions: LokiTransportOptions) =>
    new LokiTransport({
      host: transportOptions.host,
      format: format.json(),
      json: true,
      labels: transportOptions.serviceName
        ? {
            serviceName: transportOptions.serviceName,
          }
        : undefined,
      level: transportOptions.level,
      basicAuth: transportOptions.basicAuth,
      onConnectionError: (err) => console.error(err),
    }),
} satisfies LogTransports;

/**
 * A logger implementation using Winston as the underlying logging library.
 * Supports multiple transports including console, file, and Loki.
 */
class WinstonLogger extends AbstractLogger {
  /**
   * Creates a new WinstonLogger instance.
   * @param logger - The underlying winston Logger instance
   */
  protected constructor(protected logger: CustomLogger) {
    super();
  }

  /**
   * Creates a new WinstonLogger with the specified transport configurations.
   * @param transportsOptions - Array of transport configuration options
   * @returns A new WinstonLogger instance configured with the specified transports
   */
  static createLogger = (transportsOptions: TransportOptions[]) => {
    const logger = winston.createLogger({
      levels: logLevels,
      format: winston.format.combine(winston.format.timestamp(), logFormat),
      transports: [
        ...transportsOptions.map((transportOptions) => {
          switch (transportOptions.type) {
            case 'console':
              return logTransports.console(transportOptions);
            case 'file':
              return logTransports.file(transportOptions);
            case 'loki':
              return logTransports.loki(transportOptions);
          }
        }),
      ],
      handleRejections: true,
      handleExceptions: true,
    }) as CustomLogger;
    return new WinstonLogger(logger);
  };

  /**
   * Creates a child logger with a specified path prefix.
   * @param filePath - The path to append to the logger's context
   * @returns A new WinstonLogger instance with the specified path
   */
  child = (filePath: string) => {
    return new WinstonLogger(
      this.logger.child({ fileName: path.parse(filePath).name }),
    );
  };

  /**
   * Logs a critical-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  critical = (message: string, context?: unknown) =>
    this.logger.critical(message, context);

  /**
   * Logs an error-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  error = (message: string, context?: unknown) =>
    this.logger.error(message, context);

  /**
   * Logs a warning-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  warn = (message: string, context?: unknown) =>
    this.logger.warn(message, context);

  /**
   * Logs an info-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  info = (message: string, context?: unknown) =>
    this.logger.info(message, context);

  /**
   * Logs a debug-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  debug = (message: string, context?: unknown) =>
    this.logger.debug(message, context);

  /**
   * Logs a trace-level message.
   * @param message - The message to log
   * @param context - Optional additional context to include with the log
   */
  trace = (message: string, context?: unknown) =>
    this.logger.trace(message, context);
}

export default WinstonLogger;
