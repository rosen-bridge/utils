import { RateLimiterMemory } from 'rate-limiter-flexible';

export type Rule = {
  pattern: RegExp;
  limiter: RateLimiterMemory;
};

export type PatternRate = {
  pattern: string;
  rateLimit: number;
};

export type RateLimitConfig = {
  apiThrottleWindow: number;
  apiLimitRules: PatternRate[];
};
