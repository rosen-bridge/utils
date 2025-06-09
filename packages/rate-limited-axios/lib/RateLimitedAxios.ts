import originalAxios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { Semaphore } from 'await-semaphore';
import { RateLimitedAxiosConfig } from './config';
import { Rule } from './types';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    meta: any;
  }
}

class RateLimitedAxios extends originalAxios.Axios {
  protected static queueReleaser: { [key: string]: (() => void)[] } = {};
  protected static maxWaitingReleaserKeys: {
    [key: string]: Map<() => void, ReturnType<typeof setTimeout>>;
  } = {};

  constructor(config?: AxiosRequestConfig) {
    super(
      originalAxios.mergeConfig(
        originalAxios.defaults as AxiosRequestConfig,
        config || {}
      )
    );
    this.interceptors.request.use(RateLimitedAxios.interceptorForRequest);
    this.interceptors.response.use(
      RateLimitedAxios.interceptorForResponse,
      RateLimitedAxios.interceptorForResponseError
    );
  }

  /**
   * Releases the request queue associated with the given Axios request configuration.
   * @param config
   * @returns
   */
  protected static releaseQueue = (config: InternalAxiosRequestConfig) => {
    const url = config.url ?? '';
    const rule = RateLimitedAxios.getUrlRule(url);

    if (rule) {
      const key = rule.pattern.toString();
      if (
        Object.hasOwn(RateLimitedAxios.queueReleaser, key) &&
        RateLimitedAxios.queueReleaser[key].length > 0
      ) {
        const release = config.meta['release'];
        let releaseTime =
          rule.throttleWindow * 1000 - (Date.now() - config.meta.startedTime);
        if (releaseTime < 0) releaseTime = 0;
        setTimeout(() => {
          clearTimeout(
            RateLimitedAxios.maxWaitingReleaserKeys[key].get(release)
          );
          RateLimitedAxios.maxWaitingReleaserKeys[key].delete(release);
          // release the locked queue
          release();
          RateLimitedAxios.queueReleaser[key] = RateLimitedAxios.queueReleaser[
            key
          ].filter((r) => r != release);
        }, releaseTime);
      }
    }
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
    const rule = RateLimitedAxios.getUrlRule(url);

    if (!rule) return config;

    const key = rule.pattern.toString();
    const release = await rule.semaphore.acquire();
    config.meta = { release: release, startedTime: Date.now() };

    try {
      // It will be released after receiving the relevant response
      RateLimitedAxios.queueReleaser[key] = (
        RateLimitedAxios.queueReleaser[key] || []
      ).concat([release]);
      if (!Object.hasOwn(RateLimitedAxios.maxWaitingReleaserKeys, key))
        RateLimitedAxios.maxWaitingReleaserKeys[key] = new Map<
          () => void,
          ReturnType<typeof setTimeout>
        >();
      RateLimitedAxios.maxWaitingReleaserKeys[key].set(
        release,
        setTimeout(() => {
          RateLimitedAxiosConfig.getLogger().debug(
            `The response time has exceeded the defined limit for the ${key} URL pattern`
          );
          RateLimitedAxios.releaseQueue(config);
        }, rule.timeout * 1000)
      );
    } catch (err) {
      RateLimitedAxiosConfig.getLogger().error(
        `Error on the RateLimitedAxios.interceptorForRequest occurred: ${err}`
      );
      release();
      throw err;
    }

    return config;
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
   * return rate limiter and pattern of received url
   * @param url
   * @returns
   */
  protected static getUrlRule = (url: string): Rule | undefined => {
    for (const rule of RateLimitedAxiosConfig.getRules()) {
      if (rule.pattern.test(url)) return rule;
    }
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
