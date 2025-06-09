import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { Rule } from './types';
import { Semaphore } from 'await-semaphore';

export class RateLimitedAxiosConfig {
  protected static limitRules: Rule[] = [];
  protected static logger: AbstractLogger = new DummyLogger();

  /**
   * Add new rule to apply rate limit for it
   * @param pattern
   * @param rateLimit
   * @param throttleWindow
   */
  public static addRule(
    pattern: string,
    rateLimit: number,
    throttleWindow: number,
    timeout: number
  ) {
    RateLimitedAxiosConfig.removeRule(pattern);
    RateLimitedAxiosConfig.limitRules.push({
      pattern: new RegExp(pattern),
      semaphore: new Semaphore(rateLimit),
      throttleWindow: throttleWindow,
      timeout: timeout,
    });
  }

  /**
   * Remove rule from rate limited pattern list
   * @param pattern
   */
  public static removeRule(pattern: string) {
    RateLimitedAxiosConfig.limitRules =
      RateLimitedAxiosConfig.limitRules.filter(
        (r) => r.pattern.source !== pattern
      );
  }

  /**
   * Get current rate limit rules
   * @returns
   */
  public static getRules() {
    return RateLimitedAxiosConfig.limitRules;
  }

  /**
   * Set logger for RateLimitedAxios
   * @param logger
   */
  public static setLogger(logger: AbstractLogger) {
    RateLimitedAxiosConfig.logger = logger;
  }

  /**
   * get logger of RateLimitedAxios
   * @returns
   */
  public static getLogger() {
    return RateLimitedAxiosConfig.logger;
  }
}
