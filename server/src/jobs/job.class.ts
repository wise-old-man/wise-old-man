/* eslint-disable @typescript-eslint/no-unused-vars */
import type { JobManager } from './job-manager';
import type { JobOptions } from './types/job-options.type';

export class Job<T> {
  public static options: JobOptions = {};

  public jobManager: JobManager;

  constructor(jobManager: JobManager) {
    this.jobManager = jobManager;
  }

  async execute(payload: T): Promise<void> {}

  static getUniqueJobId(payload: unknown): string | undefined {
    return undefined;
  }
}
