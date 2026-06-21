import winston, { LeveledLogMethod } from 'winston';

/**
 * Base interface for transport configuration options.
 * @template T - The transport type identifier
 */
interface BaseTransportOptions<T> {
  /** The type of transport */
  type: T;
  /** The minimum log level for this transport */
  level: string;
}

/**
 * Configuration options for file-based logging transport.
 * Uses daily rotating files with compression support.
 */
export interface FileTransportOptions extends BaseTransportOptions<'file'> {
  /** The file path pattern for log files */
  path: string;
  /** Maximum size of each log file before rotation (e.g., '20m') */
  maxSize: string;
  /** Maximum number of log files to keep (e.g., '14d') */
  maxFiles: string;
  /** The minimum log level for this transport */
  level: string;
  /** Optional service name label */
  serviceName?: string;
  /** Optional format for the log file. Defaults to plain text. */
  format?: 'plain' | 'json';
  /** Optional flag to create a tailable symlink to the current active log file. Defaults to false. */
  createSymlink?: boolean;
  /** Optional name for the symlink file. */
  symlinkName?: string;
}

/**
 * Configuration options for Grafana Loki logging transport.
 */
export interface LokiTransportOptions extends BaseTransportOptions<'loki'> {
  /** The Loki server host URL */
  host: string;
  /** Optional basic authentication credentials */
  basicAuth?: string;
  /** Optional service name label for Loki */
  serviceName?: string;
  /** The minimum log level for this transport */
  level: string;
}

/**
 * Configuration options for console logging transport.
 */
export type ConsoleTransportOptions = BaseTransportOptions<'console'>;

/**
 * Union type of all available transport configuration options.
 */
export type TransportOptions =
  | FileTransportOptions
  | ConsoleTransportOptions
  | LokiTransportOptions;

/**
 * Factory function type for creating winston transports.
 * @template T - The transport options type
 */
export interface TransportFactory<T extends TransportOptions> {
  (transportOptions: T): winston.transport;
}

/**
 * Mapping of transport types to their factory functions.
 */
export type LogTransports = {
  [Key in TransportOptions['type']]:
    | TransportFactory<ConsoleTransportOptions>
    | TransportFactory<FileTransportOptions>
    | TransportFactory<LokiTransportOptions>;
};

/**
 * Custom log levels mapping for winston logger.
 * Lower numbers indicate higher priority.
 */
export const logLevels = {
  critical: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
} as const;

export type LogLevels = typeof logLevels;

export type CustomLogger = winston.Logger & {
  [L in keyof LogLevels]: LeveledLogMethod;
};
