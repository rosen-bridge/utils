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

  static init(factoryInstance: AbstractLoggerFactory): void {
    const instance = new DefaultLoggerFactory(factoryInstance);
  }

  getInstance = () => {
    return this.instance;
  };

  getDefaultLogger = () => {
    return this.loggerFactory.getDefaultLogger();
  };

  getLogger = (filePath: string) => {
    return this.loggerFactory.getLogger(filePath);
  };
}
