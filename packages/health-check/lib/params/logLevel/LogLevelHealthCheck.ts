import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from '../AbstractHealthCheckParam';
import { AbstractLogger } from '@rosen-bridge/logger-interface';
import { upperFirst } from 'lodash-es';

type LogLevel = keyof AbstractLogger;

class LogLevelHealthCheck extends AbstractHealthCheckParam {
  // list of occurrence of logs
  protected times: Array<number>;
  // last occurred log
  protected lastMessage: string;
  // expected log level
  protected readonly level: LogLevel;
  // unhealthy status
  protected readonly unhealthyStatus: HealthStatusLevel;
  // maximum allowed log in selected level. if more logs occurred status become unhealthy
  protected readonly maxAllowedCount: number;
  // time window for occurrence of logs
  protected readonly timeWindow: number;
  // last update time
  protected lastUpdate: Date;

  /**
   * wrapping a log function.
   * if logging level is as what we expected store logging time
   * then call old logging function
   * @param level: selected logs level
   * @param oldFn: old logging function
   */
  protected wrapLoggingFn = (
    level: LogLevel,
    oldFn: (message: string) => unknown
  ) => {
    return (message: string) => {
      if (level === this.level) {
        this.times.push(Date.now());
        this.lastMessage = message;
        this.update();
      }
      oldFn(message);
    };
  };

  /**
   * wrap all logging functions in a logger
   * @param logger
   */
  protected wrapLogger = (logger: AbstractLogger) => {
    logger.debug = this.wrapLoggingFn('debug', logger.debug);
    logger.info = this.wrapLoggingFn('info', logger.info);
    logger.warn = this.wrapLoggingFn('warn', logger.warn);
    logger.error = this.wrapLoggingFn('error', logger.error);
  };

  constructor(
    logger: AbstractLogger,
    unhealthyStatus: HealthStatusLevel,
    maxAllowedLog: number,
    durationSeconds: number,
    level: LogLevel
  ) {
    super();
    this.times = [];
    this.level = level;
    this.unhealthyStatus = unhealthyStatus;
    this.maxAllowedCount = maxAllowedLog;
    this.timeWindow = durationSeconds;
    this.wrapLogger(logger);
  }

  /**
   * update parameter and remove old logging times
   */
  update = () => {
    this.lastUpdate = new Date();
    const firstTime = Date.now() - this.timeWindow;
    this.times = this.times.filter((item) => item > firstTime);
  };

  /**
   * get logging description. if status is not HEALTHY return last occured error
   */
  getDescription = async () => {
    if (this.times.length > this.maxAllowedCount) {
      return `There are ${this.times.length} ${this.level} in logs. The last one is "${this.lastMessage}"`;
    }
    return undefined;
  };

  /**
   * get current health status.
   * if logs in time window more than expected count return selected unhealthy status
   * otherwise return HEALTHY
   */
  getHealthStatus = async () => {
    if (this.times.length > this.maxAllowedCount) {
      return this.unhealthyStatus;
    }
    return HealthStatusLevel.HEALTHY;
  };

  /**
   * get logger health param id
   */
  getId = () => {
    return `${upperFirst(this.level)} in Logs`;
  };

  /**
   * get last updated time
   */
  getLastUpdatedTime = () => {
    return Promise.resolve(this.lastUpdate);
  };
}

export { LogLevelHealthCheck };
