import { NameChangeStatus } from '../../../types';
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
    const pending = await nameService.getList(null, NameChangeStatus.PENDING, { limit: 100, offset: 0 });

    pending.forEach((p, i) => {
      const delay = (i + 1) * REVIEW_COOLDOWN;
      jobs.add('ReviewNameChange', { id: p.id }, { delay });
    });
  }
}

export default new RefreshNameChanges();
