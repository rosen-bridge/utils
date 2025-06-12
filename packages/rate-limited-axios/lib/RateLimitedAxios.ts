import originalAxios, {
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { Semaphore } from 'await-semaphore';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { RateLimitedAxiosConfig } from './config';

class RateLimitedAxios extends originalAxios.Axios {
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
    const url = config.baseURL
      ? originalAxios.getUri({ baseURL: config.baseURL, url: config.url })
      : config.url ?? '';
    const [limiter, pattern, semaphore] =
      RateLimitedAxios.getLimiterAndPatternOfUrl(url);

    if (!limiter) return config;

    const key = pattern.toString();
    const release = await semaphore.acquire();

    try {
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
  ): [RateLimiterMemory, RegExp, Semaphore] | [null, null, null] => {
    for (const {
      pattern,
      limiter,
      semaphore,
    } of RateLimitedAxiosConfig.getRules()) {
      if (pattern.test(url)) return [limiter, pattern, semaphore];
    }
    return [null, null, null];
  };

  /**
   * Create a rate-limited axios instance
   * @param config
   * @returns
   */
  public create = (config: AxiosRequestConfig = {}) => {
    const axiosInstance = new RateLimitedAxios(
      originalAxios.mergeConfig(
        this.defaults as AxiosRequestConfig,
        config || {}
      )
    );
    return axiosInstance;
  };
}

/**
 * Create a rate-limited axios instance
 * @param config
 * @returns
 */
const create = (config: AxiosRequestConfig = {}) => {
  const axiosInstance = new RateLimitedAxios(config);
  return axiosInstance;
};

export { RateLimitedAxios, RateLimitedAxiosConfig, create };
