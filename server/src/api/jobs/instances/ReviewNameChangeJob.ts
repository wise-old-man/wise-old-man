import * as nameChangeServices from '../../modules/name-changes/name-change.services';
import { JobType, JobDefinition } from '../job.types';

export interface ReviewNameChangePayload {
  nameChangeId: number;
}

class ReviewNameChangeJob implements JobDefinition<ReviewNameChangePayload> {
  type: JobType;

  constructor() {
    this.type = JobType.REVIEW_NAME_CHANGE;
  }

  async execute(data: ReviewNameChangePayload) {
    await nameChangeServices.autoReviewNameChange({ id: data.nameChangeId });
  }
}

export default new ReviewNameChangeJob();
