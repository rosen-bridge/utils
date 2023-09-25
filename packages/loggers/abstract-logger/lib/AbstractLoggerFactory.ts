import { AbstractLogger } from './logger/AbstractLogger';

export abstract class AbstractLoggerFactory {
  protected static instance: AbstractLoggerFactory | undefined;

  protected logger: AbstractLogger | undefined;

  /**
   * create an instance of logger factory, accepting options as params
   */
  static init?: (...args: any[]) => void;

  /**
   * get instance of the class and create the instance if the instance doesn't
   * exist (only in case of absent `init` method)
   */
  static getInstance: () => AbstractLoggerFactory;

  /**
   * get default, file-agnostic logger
   */
  getDefaultLogger?: () => AbstractLogger;

  /**
   * get a logger to be used in a specific file located under `filePath`
   *
   * @param filePath
   */
  getLogger: (filePath: string) => AbstractLogger;
}
