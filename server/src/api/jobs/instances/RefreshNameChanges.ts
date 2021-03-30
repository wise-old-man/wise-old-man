import { NameChangeStatus } from '../../../types';
import metricsService from '../../services/external/metrics.service';
import * as nameService from '../../services/internal/name.service';
import jobs, { Job } from '../index';

/**
 * The delay between each review, in milliseconds, to prevent
 * overloading the server with this low priority task
 */
const REVIEW_COOLDOWN = 90000;

class RefreshNameChanges implements Job {
  name: string;

  constructor() {
    this.name = 'RefreshNameChanges';
  }

  async handle(): Promise<void> {
    const endTimer = metricsService.trackJobStarted();

    try {
      const pagination = { limit: 100, offset: 0 };
      const pending = await nameService.getList(null, NameChangeStatus.PENDING, pagination);

      pending.forEach((p, i) => {
        const delay = (i + 1) * REVIEW_COOLDOWN;
        jobs.add('ReviewNameChange', { id: p.id }, { delay });
      });

      metricsService.trackJobEnded(endTimer, this.name, 1);
    } catch (error) {
      metricsService.trackJobEnded(endTimer, this.name, 0);
      throw error;
    }
  }
}

export default new RefreshNameChanges();
