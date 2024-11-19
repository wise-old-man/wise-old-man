import type { JobManager } from '../job.manager';
import { Job } from '../job.utils';

type CheckPlayerBannedJobPayload = {
  username: string;
};

export class CheckPlayerBannedJob extends Job<CheckPlayerBannedJobPayload> {
  constructor(jobManager: JobManager) {
    super(jobManager);
    this.options.rateLimiter = { max: 1, duration: 5000 };
  }

  async execute(_payload: CheckPlayerBannedJobPayload) {}
}
