import {
  AbstractHealthCheckParam,
  HealthStatusLevel,
} from './AbstractHealthCheckParam';
import { AbstractLogger } from '@rosen-bridge/logger-interface';

type Level = 'error' | 'warning' | 'info' | 'debug';

class LogLevelHealthCheck extends AbstractHealthCheckParam {
  protected times: Array<number>;
  protected lastMessage: string;
  protected readonly level: Level;
  protected readonly unHealthyStatus: HealthStatusLevel;
  protected readonly maxAllowedCount: number;
  protected readonly timeWindow: number;
  protected lastUpdate: Date;

  protected wrapLoggingFn = (
    level: Level,
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

  protected wrapLogger = (logger: AbstractLogger) => {
    logger.debug = this.wrapLoggingFn('debug', logger.debug);
    logger.info = this.wrapLoggingFn('info', logger.info);
    logger.warn = this.wrapLoggingFn('warning', logger.warn);
    logger.error = this.wrapLoggingFn('error', logger.error);
  };

  constructor(
    logger: AbstractLogger,
    unHealthyStatus: HealthStatusLevel,
    maxAllowedLog: number,
    durationMiliSeconds: number,
    level: Level
  ) {
    super();
    this.times = [];
    this.level = level;
    this.unHealthyStatus = unHealthyStatus;
    this.maxAllowedCount = maxAllowedLog;
    this.timeWindow = durationMiliSeconds;
    this.wrapLogger(logger);
  }

  update = () => {
    this.lastUpdate = new Date();
    const firstTime = Date.now() - this.timeWindow;
    this.times = this.times.filter((item) => item > firstTime);
  };

  getDescription = () => {
    if (this.times.length > this.maxAllowedCount) {
      return Promise.resolve(
        `There are ${this.times.length} ${this.level} log(s). Last one is "${this.lastMessage}"`
      );
    }
    return Promise.resolve('');
  };

  getHealthStatus = () => {
    if (this.times.length > this.maxAllowedCount) {
      return Promise.resolve(this.unHealthyStatus);
    }
    return Promise.resolve(HealthStatusLevel.HEALTHY);
  };

  getId = () => {
    return `${this.level} logs`;
  };

  getLastUpdatedTime = () => {
    return Promise.resolve(this.lastUpdate);
  };
}

export { LogLevelHealthCheck };
