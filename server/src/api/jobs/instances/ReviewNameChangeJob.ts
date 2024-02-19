import { autoReviewNameChange } from '../../modules/name-changes/services/AutoReviewNameChangeService';
import { JobType, JobDefinition, JobOptions } from '../job.types';

export interface ReviewNameChangePayload {
  id: number;
}

class ReviewNameChangeJob implements JobDefinition<ReviewNameChangePayload> {
  type: JobType;
  options: JobOptions;

  constructor() {
    this.type = JobType.REVIEW_NAME_CHANGE;
    this.options = {
      rateLimiter: { max: 1, duration: 5000 }
    };
  }

  async execute(data: ReviewNameChangePayload) {
    await autoReviewNameChange(data.id);
  }
}

export default new ReviewNameChangeJob();
