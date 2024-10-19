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
