import { AbstractLogger } from './logger/abstractLogger';

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
  // eslint-disable-next-line no-unused-vars
  getLogger: (filePath: string) => AbstractLogger;
}
