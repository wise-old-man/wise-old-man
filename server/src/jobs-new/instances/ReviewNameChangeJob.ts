import { autoReviewNameChange } from '../../api/modules/name-changes/services/AutoReviewNameChangeService';
import type { JobManager } from '../job.manager';
import { Job } from '../job.utils';

type ReviewNameChangeJobPayload = {
  nameChangeId: number;
};

export class ReviewNameChangeJob extends Job<ReviewNameChangeJobPayload> {
  constructor(jobManager: JobManager) {
    super(jobManager);
    this.options.rateLimiter = { max: 1, duration: 5000 };
  }

  async execute(payload: ReviewNameChangeJobPayload) {
    await autoReviewNameChange(payload.nameChangeId);
  }
}
