import type { JobManager } from '../job.manager';
import { Job } from '../job.utils';

type CheckPlayerRankedJobPayload = {
  username: string;
};

export class CheckPlayerRankedJob extends Job<CheckPlayerRankedJobPayload> {
  constructor(jobManager: JobManager) {
    super(jobManager);

    this.options = {
      rateLimiter: { max: 1, duration: 5_000 },
      attempts: 3,
      backoff: { type: 'exponential', delay: 60_000 } // first attempt after 60 seconds, then 120, and then 240 (total: 7 minutes span)
    };
  }

  async execute(_payload: CheckPlayerRankedJobPayload) {}
}
