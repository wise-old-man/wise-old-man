import { PERIODS } from '../../../utils';
import { JobType, JobDefinition } from '../job.types';
import { jobManager } from '..';

// Wait 1h between invalidating periods
const COOLDOWN = 3_600_000;

/**
 * This job is to be executed by a cron, every 6h,
 * it schedules the deletion of outdated cache deltas.
 *
 * Invalidation jobs are scheduled 1 hour apart, for each supported Delta period.
 * Ex: At midnight invalidate FIVE_MIN deltas, at 1AM invalidate DAY deltas, etc.
 */
class ScheduleDeltaInvalidations implements JobDefinition<unknown> {
  type: JobType;

  constructor() {
    this.type = JobType.SCHEDULE_DELTA_INVALIDATIONS;
  }

  async execute() {
    PERIODS.forEach((period, i) => {
      jobManager.add(
        { type: JobType.INVALIDATE_PERIOD_DELTAS, payload: { period } },
        { delay: (i + 1) * COOLDOWN }
      );
    });
  }
}

export default new ScheduleDeltaInvalidations();
