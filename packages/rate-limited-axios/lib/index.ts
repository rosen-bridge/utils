import originalAxios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
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
  protected static queueReleaser: { [key: string]: () => void } = {};
  protected static maxWaitingReleaserKeys: {
    [key: string]: ReturnType<typeof setTimeout>;
  } = {};
  protected static consumedData: { [key: string]: number } = {};
  protected static logger: AbstractLogger;

  constructor(config?: AxiosRequestConfig) {
    if (!RateLimitedAxios.refreshPeriodInterval || !RateLimitedAxios.rules) {
      throw new Error('Rate limit configs not initialized');
    }
    super(config);
    this.interceptors.request.use(RateLimitedAxios.interceptorForRequest);
    this.interceptors.response.use(
      RateLimitedAxios.interceptorForResponse,
      RateLimitedAxios.interceptorForResponseError
    );
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
        `Instantiation of this class is not allowed until the initConfigs method has been successfully invoked.`
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
        maxWaitingTimeAsSeconds: rule.maxWaitingTimeAsSeconds,
      })
    );
    RateLimitedAxios.logger = logger;
  };

  /**
   * This function manages rate limiting for requests by matching URLs against regex patterns.
   * @param config
   * @returns
   */
  protected static interceptorForRequest = async (
    config: InternalAxiosRequestConfig
  ) => {
    const url = config.url ?? '';
    const [limiter, pattern, maxWaitingTimeAsSeconds] =
      RateLimitedAxios.getLimitData(url);

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

      // It will be released after receiving the relevant response
      RateLimitedAxios.queueReleaser[key] = release;
      RateLimitedAxios.maxWaitingReleaserKeys[key] = setTimeout(() => {
        RateLimitedAxios.logger.debug(
          `The response time has exceeded the defined limit for the ${key} URL pattern`
        );
        RateLimitedAxios.releaseQueue(config);
      }, maxWaitingTimeAsSeconds * 1000);
    } catch (err) {
      RateLimitedAxios.logger.error(
        `Error on the RateLimitedAxios.interceptorForRequest occurred: ${err}`
      );
      release();
      return config;
    }

    return config;
  };

  /**
   * Releases the request queue associated with the given Axios request configuration.
   * @param config
   * @returns
   */
  protected static releaseQueue = (config: InternalAxiosRequestConfig) => {
    const url = config.url ?? '';
    const [limiter, pattern] = RateLimitedAxios.getLimitData(url);

    if (limiter) {
      const key = pattern.toString();
      if (Object.hasOwn(RateLimitedAxios.queueReleaser, key)) {
        clearTimeout(RateLimitedAxios.maxWaitingReleaserKeys[key]);
        // release the locked queue
        RateLimitedAxios.queueReleaser[key]();
        delete RateLimitedAxios.queueReleaser[key];
      }
    }
  };

  /**
   * Axios response interceptor that triggers queue release logic.
   * @param response
   * @returns
   */
  protected static interceptorForResponse = (response: AxiosResponse) => {
    this.releaseQueue(response.config);
    return response;
  };

  /**
   * Axios error interceptor that handles failed responses by releasing the request queue.
   * @param error
   * @returns
   */
  protected static interceptorForResponseError = (error: AxiosError) => {
    if (error.config) this.releaseQueue(error.config);
    return Promise.reject(error);
  };

  /**
   * return rate limiter, pattern and maxWaitingTimeAsSeconds of received url
   * @param url
   * @returns [limiter, pattern, maxWaitingTimeAsSeconds]
   */
  protected static getLimitData = (
    url: string
  ): [RateLimiterMemory, RegExp, number] | [null, null, null] => {
    for (const {
      pattern,
      limiter,
      maxWaitingTimeAsSeconds,
    } of RateLimitedAxios.rules) {
      if (pattern.test(url)) return [limiter, pattern, maxWaitingTimeAsSeconds];
    }
    return [null, null, null];
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
