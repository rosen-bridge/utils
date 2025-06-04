import originalAxios, {
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { Semaphore } from 'await-semaphore';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { RateLimitedAxiosConfig } from './config';

class RateLimitedAxios extends originalAxios.Axios {
  protected static semaphorePatternList: { [key: string]: Semaphore } = {};
  protected static consumedData: { [key: string]: number } = {};

  constructor(config?: AxiosRequestConfig) {
    super(
      originalAxios.mergeConfig(
        originalAxios.defaults as AxiosRequestConfig,
        config || {}
      )
    );
    this.interceptors.request.use(RateLimitedAxios.interceptor);
  }

  /**
   * This function manages rate limiting for requests by matching URLs against regex patterns.
   * @param config
   * @returns
   */
  protected static interceptor = async (config: InternalAxiosRequestConfig) => {
    const url = config.url ?? '';
    const [limiter, pattern] = RateLimitedAxios.getLimiterAndPatternOfUrl(url);

    if (!limiter) return config;

    const key = pattern.toString();
    RateLimitedAxios.semaphorePatternList[key] =
      RateLimitedAxios.semaphorePatternList[key] ?? new Semaphore(1);

    const release = await RateLimitedAxios.semaphorePatternList[key].acquire();

    try {
      // const consumeData = await limiter.get(key);
      if ((await limiter.get(key))?.remainingPoints === 0) {
        RateLimitedAxiosConfig.getLogger().info(
          `Rate limit exceeded for "${pattern}" url pattern, waiting for ${
            (await limiter.get(key))!.msBeforeNext
          }ms`
        );
        const msBeforeNext = (await limiter.get(key))!.msBeforeNext;
        await new Promise((f) => setTimeout(f, msBeforeNext));
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
    for (const { pattern, limiter } of RateLimitedAxiosConfig.getRules()) {
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

export { RateLimitedAxios, RateLimitedAxiosConfig };
