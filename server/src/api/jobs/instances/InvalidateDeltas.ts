import moment from 'moment';
import { Period } from '../../../prisma';
import { Op } from 'sequelize';
import { Delta } from '../../../database/models';
import metricsService from '../../services/external/metrics.service';
import { Job } from '../index';

/**
 * This job is to be executed by a cron, and it clears outdated deltas.
 * Ex: Any "week" deltas that are over a week old, are deleted,
 * and should no longer appear in group/global leaderboards.
 */
class InvalidateDeltas implements Job {
  name: string;

  constructor() {
    this.name = 'InvalidateDeltas';
  }

  async handle(): Promise<void> {
    const endTimer = metricsService.trackJobStarted();

    try {
      // Delete any outdated "five_min" deltas
      await deleteInvalidPeriodDeltas(Period.FIVE_MIN, moment().subtract(1, 'hour').toDate());
      // Delete any outdated "day" deltas
      await deleteInvalidPeriodDeltas(Period.DAY, moment().subtract(24, 'hour').toDate());
      // Delete any outdated "week" deltas
      await deleteInvalidPeriodDeltas(Period.WEEK, moment().subtract(7, 'day').toDate());
      // Delete any outdated "month" deltas
      await deleteInvalidPeriodDeltas(Period.MONTH, moment().subtract(31, 'day').toDate());
      // Delete any outdated "year" deltas
      await deleteInvalidPeriodDeltas(Period.YEAR, moment().subtract(365, 'day').toDate());

      metricsService.trackJobEnded(endTimer, this.name, 1);
    } catch (error) {
      metricsService.trackJobEnded(endTimer, this.name, 0);
      throw error;
    }
  }
}

async function deleteInvalidPeriodDeltas(period: string, thresholdDate: Date) {
  await Delta.destroy({
    where: {
      period,
      updatedAt: { [Op.lt]: thresholdDate }
    }
  });
}

export default new InvalidateDeltas();
