import { JobsOptions as BullMQJobOptions, RateLimiterOptions } from 'bullmq';

export interface JobOptions extends BullMQJobOptions {
  rateLimiter?: RateLimiterOptions;
  maxConcurrent?: number;
}
