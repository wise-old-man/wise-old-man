/* eslint-disable @typescript-eslint/no-unused-vars */
import { JobsOptions, RateLimiterOptions } from 'bullmq';
import type { JobManager } from './job.manager';

export enum JobPriority {
  LOW = 3,
  MEDIUM = 2,
  HIGH = 1
}

export interface Options extends JobsOptions {
  rateLimiter?: RateLimiterOptions;
  skipDedupe?: boolean;
}

export class Job<T> {
  public name: string;
  public options: Options | undefined;
  public jobManager: JobManager;

  constructor(jobManager: JobManager) {
    this.jobManager = jobManager;
    this.name = this.constructor.name;
  }

  async execute(payload: T): Promise<void> {}
  async onSuccess(payload: T): Promise<void> {}
  async onFailure(payload: T, error: Error): Promise<void> {}
  async onFailedAllAttempts(payload: T, error: Error): Promise<void> {}
}

export type ExtractInstanceType<T> = T extends new (...args: unknown[]) => infer R
  ? R
  : T extends { prototype: infer P }
    ? P
    : unknown;

export type ValueOf<T> = T[keyof T];
