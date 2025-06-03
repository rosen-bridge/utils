import { RateLimiterMemory } from 'rate-limiter-flexible';

export type Rule = {
  pattern: RegExp;
  limiter: RateLimiterMemory;
};

export type PatternRate = {
  pattern: string;
  rateLimit: number;
  throttleWindow: number;
};
