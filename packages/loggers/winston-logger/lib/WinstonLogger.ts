import path from 'path';
import winston, { format } from 'winston';
import 'winston-daily-rotate-file';

import { AbstractLoggerFactory } from '@rosen-bridge/abstract-logger';
import JsonBigInt from '@rosen-bridge/json-bigint';

import {
  ConsoleTransportOptions,
  FileTransportOptions,
  TransportOptions,
  LogTransports,
  LokiTransportOptions,
} from './types';

import printf = format.printf;
import LokiTransport from 'winston-loki';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const logFormat = printf(
  ({ level, message, timestamp, fileName, ...context }) => {
    return `${timestamp} ${level}: [${fileName}] ${message}${
      context && Object.keys(context).length
        ? ` ${JsonBigInt.stringify(context)}`
        : ''
    }`;
  }
);

const logTransports = {
  console: (transportOptions: ConsoleTransportOptions) =>
    new winston.transports.Console({
      format: winston.format.simple(),
      level: transportOptions.level,
    }),
  file: (transportOptions: FileTransportOptions) =>
    new winston.transports.DailyRotateFile({
      filename: `${transportOptions.path}-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: transportOptions.maxSize,
      maxFiles: transportOptions.maxFiles,
      level: transportOptions.level,
    }),
  loki: (transportOptions: LokiTransportOptions) =>
    new LokiTransport({
      host: transportOptions.host,
      format: format.json(),
      json: true,
      level: transportOptions.level,
      basicAuth: transportOptions.basicAuth ?? transportOptions.basicAuth,
      onConnectionError: (err) => console.error(err),
    }),
} satisfies LogTransports;

class WinstonLogger extends AbstractLoggerFactory {
  protected static instance: WinstonLogger | undefined;

  protected logger: winston.Logger | undefined;

  private constructor(transportsOptions: TransportOptions[]) {
    super();

    this.logger = winston.createLogger({
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
    });
  }

  /**
   * create an instance of the class
   *
   * @param transportsOptions
   */
  static init = (transportsOptions: TransportOptions[]) => {
    this.instance = new WinstonLogger(transportsOptions);
  };

  /**
   * get instance of the class
   */
  static getInstance = () => {
    if (this.instance) {
      return this.instance;
    }
    throw new Error(
      'You should call `WinstonLogger.init` before calling `WinstonLogger.getInstance`'
    );
  };

  /**
   * get default logger
   */
  getDefaultLogger = () => this.logger!;

  /**
   * get winston child logger from the default logger to be used in a specific
   * file located under `filePath`
   *
   * @param filePath
   */
  getLogger = (filePath: string) => {
    return this.logger!.child({
      fileName: path.parse(filePath).name,
    }) as winston.Logger;
  };
}

export default WinstonLogger;
