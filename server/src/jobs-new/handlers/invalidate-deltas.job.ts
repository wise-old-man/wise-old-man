import prisma from '../../prisma';
import { Job } from '../job.class';
import { Period, PeriodProps, PERIODS } from '../../utils';

export class InvalidateDeltasJob extends Job<unknown> {
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
