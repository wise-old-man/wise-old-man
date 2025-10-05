/* eslint-disable @typescript-eslint/no-unused-vars */
import { Job as BullJob } from 'bullmq';
import type { JobManager } from './job-manager';
import type { JobOptions } from './types/job-options.type';

export class Job<T> {
  public static options: JobOptions = {};

  public jobManager: JobManager;
  public bullJob: BullJob | undefined;

  constructor(jobManager: JobManager, bulljob?: BullJob) {
    this.jobManager = jobManager;

    if (bulljob) {
      this.bullJob = bulljob;
    }
  }

  async execute(payload: T): Promise<void> {}

  static getUniqueJobId(payload: unknown): string | undefined {
    return undefined;
  }
}
