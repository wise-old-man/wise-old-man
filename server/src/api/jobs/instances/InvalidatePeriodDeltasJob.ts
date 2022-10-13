import prisma from '../../../prisma';
import { Period, PeriodProps } from '../../../utils';
import { JobType, JobDefinition } from '../job.types';

export interface InvalidatePeriodDeltasPayload {
  period: Period;
}

/**
 * This job is hourly scheduled by ScheduleDeltaInvalidationsJob.
 * It deletes outdated cached deltas, so that they no longer appear in group/global leaderboards.
 */
class InvalidPeriodDeltasJob implements JobDefinition<InvalidatePeriodDeltasPayload> {
  type: JobType;

  constructor() {
    this.type = JobType.INVALIDATE_PERIOD_DELTAS;
  }

  async execute(data: InvalidatePeriodDeltasPayload) {
    const { period } = data;

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
}

export default new InvalidPeriodDeltasJob();
