import metricsService from '../../services/external/metrics.service';
import * as nameService from '../../services/internal/name.service';
import { Job } from '../index';

class ReviewNameChange implements Job {
  name: string;

  constructor() {
    this.name = 'ReviewNameChange';
  }

  async handle(data: any): Promise<void> {
    const endTimer = metricsService.trackJobStarted();

    try {
      await nameService.autoReview(data.id);

      metricsService.trackJobEnded(endTimer, this.name, 1);
    } catch (error) {
      metricsService.trackJobEnded(endTimer, this.name, 0);
      throw error;
    }
  }
}

export default new ReviewNameChange();
