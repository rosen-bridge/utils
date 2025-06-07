import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Semaphore } from 'await-semaphore';

export type Rule = {
  pattern: RegExp;
  limiter: RateLimiterMemory;
  semaphore: Semaphore;
};

export type PatternRate = {
  pattern: string;
  rateLimit: number;
  throttleWindow: number;
};
