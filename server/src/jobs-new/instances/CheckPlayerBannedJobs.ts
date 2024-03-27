import type { JobManager } from '../job.manager';
import { Job } from '../job.utils';

type CheckPlayerBannedJobPayload = { username: string };

export class CheckPlayerBannedJob extends Job<CheckPlayerBannedJobPayload> {
  constructor(jobManager: JobManager) {
    super(jobManager);

    this.options = {
      attempts: 2,
      backoff: 10_000
    };
  }

  async execute(payload: CheckPlayerBannedJobPayload) {
    console.log(this.name, payload.username);
    if (Math.random() < 0.9999) throw new Error('Yep!');
  }

  async onFailure(payload: CheckPlayerBannedJobPayload, error: Error) {
    console.log(payload.username, error);
  }

  async onFailedAllAttempts(payload: CheckPlayerBannedJobPayload, error: Error) {
    console.log('FAILED ALL', payload.username, error);
  }
}
