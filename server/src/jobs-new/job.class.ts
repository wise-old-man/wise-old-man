/* eslint-disable @typescript-eslint/no-unused-vars */
import type { JobManager } from './job-manager';
import type { JobOptions } from './types/job-options.type';

export class Job<T> {
  public options: JobOptions;
  public jobManager: JobManager;

  constructor(jobManager: JobManager) {
    this.jobManager = jobManager;
    this.options = {};
  }

  async execute(payload: T): Promise<void> {}
  async onSuccess(payload: T): Promise<void> {}
  async onFailure(payload: T, error: Error): Promise<void> {}
  async onFailedAllAttempts(payload: T, error: Error): Promise<void> {}
}
