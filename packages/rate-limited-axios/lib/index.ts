import axios, { AxiosRequestConfig } from 'axios';
import { RateLimitedAxios, RateLimitedAxiosConfig } from './RateLimitedAxios';
export { Rule } from './types';
export * from 'axios';

function createInstance(config?: AxiosRequestConfig) {
  const instance = new RateLimitedAxios(config) as RateLimitedAxios & {
    default: ReturnType<typeof createInstance>;
    create: (config?: AxiosRequestConfig) => ReturnType<typeof createInstance>;
  };

  instance.create = function create(instanceConfig?: AxiosRequestConfig) {
    return createInstance(
      axios.mergeConfig(
        axios.defaults as AxiosRequestConfig,
        instanceConfig ?? {}
      )
    );
  };

  return instance;
}

const rateLimitedAxios = createInstance(axios.defaults as AxiosRequestConfig);
rateLimitedAxios.default = rateLimitedAxios;

// This module is intended to unwrap RateLimitedAxios default export as named.
// Keep top-level export same with static properties
const {
  AxiosError,
  CanceledError,
  isCancel,
  CancelToken,
  VERSION,
  all,
  Cancel,
  isAxiosError,
  spread,
  toFormData,
  AxiosHeaders,
  HttpStatusCode,
  formToJSON,
  getAdapter,
  mergeConfig,
} = rateLimitedAxios;

export {
  rateLimitedAxios as default,
  RateLimitedAxios,
  RateLimitedAxiosConfig,
  AxiosError,
  CanceledError,
  isCancel,
  CancelToken,
  VERSION,
  all,
  Cancel,
  isAxiosError,
  spread,
  toFormData,
  AxiosHeaders,
  HttpStatusCode,
  formToJSON,
  getAdapter,
  mergeConfig,
};
