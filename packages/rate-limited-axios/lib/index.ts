import {
  RateLimitedAxios,
  RateLimitedAxiosConfig,
  create,
} from './RateLimitedAxios';
export { Rule } from './types';
export * from 'axios';
export default {
  create: create,
  RateLimitedAxios: RateLimitedAxios,
  RateLimitedAxiosConfig: RateLimitedAxiosConfig,
};
