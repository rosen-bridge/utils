import winston from 'winston';

interface BaseTransportOptions<T> {
  type: T;
  level: string;
}

export interface FileTransportOptions extends BaseTransportOptions<'file'> {
  path: string;
  maxSize: string;
  maxFiles: string;
  level: string;
}

export type ConsoleTransportOptions = BaseTransportOptions<'console'>;

export type TransportOptions = FileTransportOptions | ConsoleTransportOptions;

export interface TransportFactory<T extends TransportOptions> {
  (transportOptions: T): winston.transport;
}

export type LogTransports = {
  [Key in TransportOptions['type']]:
    | TransportFactory<ConsoleTransportOptions>
    | TransportFactory<FileTransportOptions>;
};
