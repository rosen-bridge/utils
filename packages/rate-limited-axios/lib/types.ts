import { RateLimiterMemory } from 'rate-limiter-flexible';

export type Rule = {
  pattern: RegExp;
  limiter: RateLimiterMemory;
  maxWaitingTimeAsSeconds: number;
};

export type PatternRate = {
  pattern: string;
  rateLimit: number;
  maxWaitingTimeAsSeconds: number;
};

export type RateLimitConfig = {
  apiLimitRateRangeAsSeconds: number;
  apiLimitRules: PatternRate[];
};
