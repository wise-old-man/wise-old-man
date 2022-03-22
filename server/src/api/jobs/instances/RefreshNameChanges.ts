import { NameChangeStatus } from '../../../types';
import metricsService from '../../services/external/metrics.service';
import * as nameChangeService from '../../modules/name-changes/name-change.services';
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
      // List the latest 100 pending name change requests
      const pending = await nameChangeService.searchNameChanges({
        status: NameChangeStatus.PENDING,
        limit: 100
      });

      // Schedule a name change review for each, with a 90sec interval between them
      pending.forEach((p, i) => {
        jobs.add('ReviewNameChange', { id: p.id }, { delay: (i + 1) * REVIEW_COOLDOWN });
      });

      metricsService.trackJobEnded(endTimer, this.name, 1);
    } catch (error) {
      metricsService.trackJobEnded(endTimer, this.name, 0);
      throw error;
    }
  }
}

export default new RefreshNameChanges();
