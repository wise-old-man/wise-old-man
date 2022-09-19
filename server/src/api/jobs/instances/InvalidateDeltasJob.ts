import prisma from '../../../prisma';
import { Period, PeriodProps } from '../../../utils';
import { JobType, JobDefinition } from '../job.types';

/**
 * This job is to be executed by a cron, and it clears outdated deltas.
 * Ex: Any "week" deltas that are over a week old, are deleted,
 * and should no longer appear in group/global leaderboards.
 */
class InvalidateDeltasJob implements JobDefinition<{}> {
  type: JobType;

  constructor() {
    this.type = JobType.INVALIDATE_DELTAS;
  }

  async execute() {
    // Delete any outdated "five_min" deltas, if not updated within the past hour
    await deleteInvalidPeriodDeltas(Period.FIVE_MIN);
    // Delete any outdated "day" deltas
    await deleteInvalidPeriodDeltas(Period.DAY);
    // Delete any outdated "week" deltas
    await deleteInvalidPeriodDeltas(Period.WEEK);
    // Delete any outdated "month" deltas
    await deleteInvalidPeriodDeltas(Period.MONTH);
    // Delete any outdated "year" deltas
    await deleteInvalidPeriodDeltas(Period.YEAR);
  }
}

async function deleteInvalidPeriodDeltas(period: Period) {
  // Usually deltas become invalid after existing for more than their period's duration
  // Except for 5min deltas, which only become invalid after 1 hour.
  const thresholdMs =
    period === Period.FIVE_MIN
      ? PeriodProps[Period.FIVE_MIN].milliseconds * 12
      : PeriodProps[period].milliseconds;

  await prisma.delta.deleteMany({
    where: {
      period,
      updatedAt: { lt: new Date(Date.now() - thresholdMs) }
    }
  });
}

export default new InvalidateDeltasJob();
