import prisma from '../../../prisma';
import { Period, PeriodProps } from '../../../utils';
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
      // Delete any outdated "five_min" deltas, if not updated within the past hour
      await deleteInvalidPeriodDeltaz(Period.FIVE_MIN);
      // Delete any outdated "day" deltas
      await deleteInvalidPeriodDeltaz(Period.DAY);
      // Delete any outdated "week" deltas
      await deleteInvalidPeriodDeltaz(Period.WEEK);
      // Delete any outdated "month" deltas
      await deleteInvalidPeriodDeltaz(Period.MONTH);
      // Delete any outdated "year" deltas
      await deleteInvalidPeriodDeltaz(Period.YEAR);

      metricsService.trackJobEnded(endTimer, this.name, 1);
    } catch (error) {
      metricsService.trackJobEnded(endTimer, this.name, 0);
      throw error;
    }
  }
}

async function deleteInvalidPeriodDeltaz(period: Period) {
  // Usually deltas become invalid after existing for more than their period's duration
  // Except for 5min deltas, which only become invalid after 1 hour.
  const thresholdMs =
    period === Period.FIVE_MIN
      ? PeriodProps[Period.FIVE_MIN].milliseconds * 12
      : PeriodProps[period].milliseconds;

  await prisma.delta.deleteMany({
    where: { period, updatedAt: { lt: new Date(Date.now() - thresholdMs) } }
  });
}

export default new InvalidateDeltas();
