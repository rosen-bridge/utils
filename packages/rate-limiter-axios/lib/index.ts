import originalAxios, {
  AxiosRequestConfig,
  AxiosInstance,
  InternalAxiosRequestConfig,
  CreateAxiosDefaults,
} from 'axios';
import { Semaphore } from 'await-semaphore';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { RateLimiterMemory } from 'rate-limiter-flexible';

import { Rule } from './types';

class RateLimiterAxios extends originalAxios.Axios {
  protected static semaphorePatternList: { [key: string]: Semaphore } = {};
  protected static refreshPeriodInterval: number;
  protected static rules: Rule[] = [];
  protected static logger: AbstractLogger;

  constructor(config?: AxiosRequestConfig) {
    if (!RateLimiterAxios.refreshPeriodInterval || !RateLimiterAxios.rules) {
      throw new Error('Rate limit configs not initialized');
    }
    super(config);
    this.interceptors.request.use(RateLimiterAxios.axiosInterceptor);
  }

  /**
   * Initialize the rate-limited configurations
   * @param apiLimitRateRangeAsMilliseconds initial rate limit range in milliseconds
   * @param apiLimitRules initial rate limit rules
   * @returns
   */
  public static initConfigs = (
    apiLimitRateRangeAsMilliseconds: number,
    apiLimitRules: { pattern: string; rateLimit: number }[],
    logger: AbstractLogger = new DummyLogger()
  ) => {
    if (RateLimiterAxios.refreshPeriodInterval && RateLimiterAxios.rules)
      return;
    RateLimiterAxios.refreshPeriodInterval = apiLimitRateRangeAsMilliseconds;
    RateLimiterAxios.rules = apiLimitRules.map(
      (rule: { pattern: string; rateLimit: number }) => ({
        pattern: new RegExp(rule.pattern),
        limiter: new RateLimiterMemory({
          points: rule.rateLimit,
          duration: RateLimiterAxios.refreshPeriodInterval,
        }),
      })
    );
    RateLimiterAxios.logger = logger;
  };

  /**
   * This function is used to manage URLs rate-limit of request based on regex patterns
   * @param config
   * @returns
   */
  protected static axiosInterceptor = async (
    config: InternalAxiosRequestConfig
  ) => {
    const url = config.url ?? '';
    const [limiter, pattern] = RateLimiterAxios.getLimiterAndPatternForUrl(url);

    if (!limiter) return config;

    RateLimiterAxios.semaphorePatternList[pattern.toString()] =
      RateLimiterAxios.semaphorePatternList[pattern.toString()] ??
      new Semaphore(1);

    const release = await RateLimiterAxios.semaphorePatternList[
      pattern.toString()
    ].acquire();

    try {
      const consumeData = await limiter.consume(pattern.toString());
      if (consumeData.remainingPoints === 0) {
        RateLimiterAxios.logger.info(
          `Rate limit exceeded for "${pattern}" url pattern, waiting for ${consumeData.msBeforeNext}ms`
        );
        await new Promise((f) => setTimeout(f, consumeData.msBeforeNext));
      }
    } finally {
      release();
    }

    return config;
  };

  /**
   * return rate limiter and pattern of received url
   * @param url
   * @returns
   */
  protected static getLimiterAndPatternForUrl = (
    url: string
  ): [RateLimiterMemory, RegExp] | [null, null] => {
    for (const { pattern, limiter } of RateLimiterAxios.rules) {
      if (pattern.test(url)) return [limiter, pattern];
    }
    return [null, null];
  };

  /**
   * Create a rate-limited axios instance
   * @param config
   * @returns
   */
  static create = (config: CreateAxiosDefaults = {}) => {
    const axiosInstance = new RateLimiterAxios(config as AxiosRequestConfig);
    return axiosInstance;
  };
}

export default RateLimiterAxios;
