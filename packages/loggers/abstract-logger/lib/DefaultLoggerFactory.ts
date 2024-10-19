import { AbstractLoggerFactory } from './AbstractLoggerFactory';

export class DefaultLoggerFactory extends AbstractLoggerFactory {
  protected static instance: DefaultLoggerFactory;
  protected constructor(protected loggerFactory: AbstractLoggerFactory) {
    super();
  }

  /**
   * initialize logger factory class
   * @param factoryInstance
   */
  static init(factoryInstance: AbstractLoggerFactory): void {
    this.instance = new DefaultLoggerFactory(factoryInstance);
  }

  /**
   * get instance of the class
   * exist (only in case of absent `init` method)
   */
  static getInstance = () => {
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
