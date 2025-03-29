import { JobsOptions as BullMQJobOptions, RateLimiterOptions } from 'bullmq';

export interface JobOptions extends BullMQJobOptions {
  rateLimiter?: RateLimiterOptions;
  skipDedupe?: boolean;
  maxConcurrent?: number;
}
