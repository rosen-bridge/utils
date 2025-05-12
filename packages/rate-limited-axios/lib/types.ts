export type PatternRate = {
  pattern: string;
  rateLimit: number;
  maxWaitingTimeAsSeconds: number;
};

export type RateLimitConfig = {
  apiLimitRateRangeAsSeconds: number;
  apiLimitRules: PatternRate[];
};
