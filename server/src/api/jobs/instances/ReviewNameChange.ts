import metricsService from '../../services/external/metrics.service';
import * as nameChangeServices from '../../modules/name-changes/name-change.services';
import { Job } from '../index';

class ReviewNameChange implements Job {
  name: string;

  constructor() {
    this.name = 'ReviewNameChange';
  }

  async handle(data: any): Promise<void> {
    const endTimer = metricsService.trackJobStarted();

    try {
      await nameChangeServices.autoReviewNameChange({ id: parseInt(data.id) });

      metricsService.trackJobEnded(endTimer, this.name, 1);
    } catch (error) {
      metricsService.trackJobEnded(endTimer, this.name, 0);
      throw error;
    }
  }
}

export default new ReviewNameChange();
