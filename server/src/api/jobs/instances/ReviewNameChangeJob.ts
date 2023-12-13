import * as nameChangeServices from '../../modules/name-changes/name-change.services';
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
    await nameChangeServices.autoReviewNameChange({ id: data.id });
  }
}

export default new ReviewNameChangeJob();
