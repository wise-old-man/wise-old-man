import { autoReviewNameChange } from '../../api/modules/name-changes/services/AutoReviewNameChangeService';
import { Job } from '../job.utils';

class ReviewNameChangeJob extends Job {
  private nameChangeId: number;

  constructor(nameChangeId: number) {
    super(nameChangeId);
    this.nameChangeId = nameChangeId;

    this.options = {
      rateLimiter: { max: 1, duration: 5000 }
    };
  }

  async execute() {
    await autoReviewNameChange(this.nameChangeId);
  }
}

export { ReviewNameChangeJob };
