import originalAxios, {
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { Semaphore } from 'await-semaphore';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';
import { RateLimiterMemory } from 'rate-limiter-flexible';

import { PatternRate, RateLimitConfig, Rule } from './types';

class RateLimitedAxios extends originalAxios.Axios {
  protected static semaphorePatternList: { [key: string]: Semaphore } = {};
  protected static refreshPeriodInterval: number;
  protected static rules: Rule[] = [];
  protected static consumedData: { [key: string]: number } = {};
  protected static logger: AbstractLogger;

  constructor(config?: AxiosRequestConfig) {
    if (!RateLimitedAxios.refreshPeriodInterval || !RateLimitedAxios.rules) {
      throw new Error(
        'Instantiation of this class is not allowed until the initConfigs method has been successfully invoked.'
      );
    }
    super({
      ...(originalAxios.defaults as AxiosRequestConfig),
      ...config,
    });
    this.interceptors.request.use(RateLimitedAxios.interceptor);
  }

  /**
   * Initialize the rate-limited configurations
   * @param apiLimitRateRangeAsMilliseconds initial rate limit range in milliseconds
   * @param apiLimitRules initial rate limit rules
   * @returns
   */
  public static initConfigs = (
    rateLimitConfig: RateLimitConfig,
    logger: AbstractLogger = new DummyLogger()
  ) => {
    if (RateLimitedAxios.refreshPeriodInterval && RateLimitedAxios.rules) {
      logger.debug(
        `Configuration has already been completed and cannot be performed again.`
      );
      return;
    }
    RateLimitedAxios.refreshPeriodInterval =
      rateLimitConfig.apiLimitRateRangeAsSeconds;
    RateLimitedAxios.rules = rateLimitConfig.apiLimitRules.map(
      (rule: PatternRate) => ({
        pattern: new RegExp(rule.pattern),
        limiter: new RateLimiterMemory({
          points: rule.rateLimit,
          duration: RateLimitedAxios.refreshPeriodInterval,
        }),
      })
    );
    RateLimitedAxios.logger = logger;
  };

  /**
   * This function manages rate limiting for requests by matching URLs against regex patterns.
   * @param config
   * @returns
   */
  protected static interceptor = async (config: InternalAxiosRequestConfig) => {
    const url = config.baseURL
      ? `${config.baseURL}${config.url}`
      : config.url ?? '';
    const [limiter, pattern] = RateLimitedAxios.getLimiterAndPatternOfUrl(url);

    if (!limiter) return config;

    const key = pattern.toString();
    RateLimitedAxios.semaphorePatternList[key] =
      RateLimitedAxios.semaphorePatternList[key] ?? new Semaphore(1);

    const release = await RateLimitedAxios.semaphorePatternList[key].acquire();

    try {
      const consumeData = await limiter.get(key);
      if (consumeData?.remainingPoints === 0) {
        RateLimitedAxios.logger.info(
          `Rate limit exceeded for "${pattern}" url pattern, waiting for ${
            consumeData!.msBeforeNext
          }ms`
        );
        await new Promise((f) => setTimeout(f, consumeData!.msBeforeNext));
      }
      await limiter.consume(key);
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
  protected static getLimiterAndPatternOfUrl = (
    url: string
  ): [RateLimiterMemory, RegExp] | [null, null] => {
    for (const { pattern, limiter } of RateLimitedAxios.rules) {
      if (pattern.test(url)) return [limiter, pattern];
    }
    return [null, null];
  };

  /**
   * Create a rate-limited axios instance
   * @param config
   * @returns
   */
  static create = (config: AxiosRequestConfig = {}) => {
    const axiosInstance = new RateLimitedAxios(config);
    return axiosInstance;
  };
}

export { RateLimitedAxios as default, RateLimitConfig };
export * from 'axios';
