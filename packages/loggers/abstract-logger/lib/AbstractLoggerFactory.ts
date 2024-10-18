import { AbstractLogger } from './logger/AbstractLogger';

export abstract class AbstractLoggerFactory {
  /**
   * get default, file-agnostic logger
   */
  getDefaultLogger: () => AbstractLogger;

  /**
   * get a logger to be used in a specific file located under `filePath`
   *
   * @param filePath
   */
  getLogger: (filePath: string) => AbstractLogger;
}

export class DefaultLoggerFactory extends AbstractLoggerFactory {
  protected instance: DefaultLoggerFactory;
  constructor(protected loggerFactory: AbstractLoggerFactory) {
    super();
  }

  /**
   * initialize logger factory class
   * @param factoryInstance
   */
  static init(factoryInstance: AbstractLoggerFactory): void {
    const instance = new DefaultLoggerFactory(factoryInstance);
  }

  /**
   * get instance of the class
   * exist (only in case of absent `init` method)
   */
  getInstance = () => {
    if (!this.instance)
      throw new Error(
        'You should call `DefaultLoggerFactory.init` before calling `DefaultLoggerFactory.getInstance`'
      );
    return this.instance;
  };

  /**
   * get default, file-agnostic logger
   */
  getDefaultLogger = () => {
    return this.loggerFactory.getDefaultLogger();
  };

  /**
   * get a logger to be used in a specific file located under `filePath`
   *
   * @param filePath
   */
  getLogger = (filePath: string) => {
    return this.loggerFactory.getLogger(filePath);
  };
}
