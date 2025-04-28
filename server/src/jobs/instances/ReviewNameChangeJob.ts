import { JobType, jobManager as newJobManager } from '../../jobs-new';
import { Job } from '../job.utils';

type ReviewNameChangeJobPayload = {
  nameChangeId: number;
};

export class ReviewNameChangeJob extends Job<ReviewNameChangeJobPayload> {
  async execute(payload: ReviewNameChangeJobPayload) {
    // Redirect to the new job manager
    newJobManager.add(JobType.REVIEW_NAME_CHANGE, { nameChangeId: payload.nameChangeId });
  }
}
