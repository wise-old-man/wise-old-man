import prisma from '../../prisma';
import { PERIODS, Period, PeriodProps } from '../../utils';
import { Job } from '../job.utils';

class ScheduleDeltaInvalidationsJob extends Job {
  async execute() {
    for (const period of PERIODS) {
      let thresholdMs = PeriodProps[period].milliseconds;

      // Usually deltas become invalid after existing for more than their period's duration
      // Except for 5min deltas, which only become invalid after 1 hour.
      if (period === Period.FIVE_MIN) {
        thresholdMs *= 12;
      }

      await prisma.delta.deleteMany({
        where: {
          period,
          updatedAt: { lt: new Date(Date.now() - thresholdMs) }
        }
      });
    }
  }
}

export { ScheduleDeltaInvalidationsJob };
