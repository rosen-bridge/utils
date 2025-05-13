import originalAxios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { Semaphore } from 'await-semaphore';
import { AbstractLogger, DummyLogger } from '@rosen-bridge/abstract-logger';

import { PatternRate, RateLimitConfig } from './types';

class RateLimitedAxios extends originalAxios.Axios {
  protected static semaphorePatternList: { [key: string]: Semaphore } = {};
  protected static refreshPeriodInterval: number;
  protected static rules: PatternRate[] = [];
  protected static queueReleaser: { [key: string]: (() => void)[] } = {};
  protected static consumedData: { [key: string]: number } = {};
  protected static logger: AbstractLogger;

  constructor(config?: AxiosRequestConfig) {
    if (!RateLimitedAxios.refreshPeriodInterval || !RateLimitedAxios.rules) {
      throw new Error(
        'Instantiation of this class is not allowed until the initConfigs method has been successfully invoked.'
      );
    }
    super(config);
    this.interceptors.request.use(
      RateLimitedAxios.interceptorForRequest,
      async (error) => {
        return Promise.reject(error);
      }
    );
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
        `Configuration has already been completed and cannot be performed again.`
      );
      return;
    }
    RateLimitedAxios.refreshPeriodInterval =
      rateLimitConfig.apiLimitRateRangeAsSeconds;
    RateLimitedAxios.rules = rateLimitConfig.apiLimitRules;
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
    const [rateLimit, pattern, maxWaitingTimeAsSeconds] =
      RateLimitedAxios.getLimitData(url);

    if (!rateLimit) return config;

    const key = pattern.toString();
    RateLimitedAxios.semaphorePatternList[key] =
      RateLimitedAxios.semaphorePatternList[key] ?? new Semaphore(rateLimit);

    let release;
    (await Promise.race([
      new Promise((resolve) => {
        RateLimitedAxios.semaphorePatternList[key].acquire().then((result) => {
          release = result;
          return resolve(config);
        });
      }),
      new Promise((resolve, reject) =>
        setTimeout(() => {
          return reject(
            new Error(
              `The response time has exceeded the defined limit for the ${key} URL pattern`
            )
          );
        }, maxWaitingTimeAsSeconds * 1000)
      ),
    ])) as InternalAxiosRequestConfig;

    RateLimitedAxios.queueReleaser[key] = (
      RateLimitedAxios.queueReleaser[key] || []
    ).concat(release ? [release] : []);

    return config;
  };

  /**
   * Releases the request queue associated with the given Axios request configuration.
   * @param config
   * @returns
   */
  protected static releaseQueue = (
    config: InternalAxiosRequestConfig,
    release: (() => void) | undefined = undefined
  ) => {
    const url = config.url ?? '';
    const [rateLimit, pattern] = RateLimitedAxios.getLimitData(url);

    if (rateLimit) {
      const key = pattern.toString();
      if (
        Object.hasOwn(RateLimitedAxios.queueReleaser, key) &&
        RateLimitedAxios.queueReleaser[key].length > 0
      ) {
        release = release ?? RateLimitedAxios.queueReleaser[key][0];
        setTimeout(() => {
          // release the locked queue
          release!();
          RateLimitedAxios.queueReleaser[key] = RateLimitedAxios.queueReleaser[
            key
          ].filter((r) => r != release);
        }, RateLimitedAxios.refreshPeriodInterval * 1000);
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
   * return rate-limit, pattern and maxWaitingTimeAsSeconds of received url
   * @param url
   * @returns [rateLimit, pattern, maxWaitingTimeAsSeconds]
   */
  protected static getLimitData = (
    url: string
  ): [number, RegExp, number] | [null, null, null] => {
    for (const {
      rateLimit,
      pattern,
      maxWaitingTimeAsSeconds,
    } of RateLimitedAxios.rules) {
      if (new RegExp(pattern).test(url))
        return [rateLimit, new RegExp(pattern), maxWaitingTimeAsSeconds];
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
