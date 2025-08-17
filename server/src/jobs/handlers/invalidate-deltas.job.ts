import prisma from '../../prisma';
import { Period, PERIODS } from '../../types';
import { PeriodProps } from '../../utils/shared';
import { Job } from '../job.class';

export class InvalidateDeltasJob extends Job<unknown> {
  async execute() {
    await prisma.$transaction(async transaction => {
      for (const period of PERIODS) {
        let thresholdMs = PeriodProps[period].milliseconds;

        // Usually deltas become invalid after existing for more than their period's duration
        // Except for 5min deltas, which only become invalid after 1 hour.
        if (period === Period.FIVE_MIN) {
          thresholdMs *= 12;
        }

        await transaction.delta.deleteMany({
          where: {
            period,
            updatedAt: { lt: new Date(Date.now() - thresholdMs) }
          }
        });

        await transaction.cachedDelta.deleteMany({
          where: {
            period,
            updatedAt: { lt: new Date(Date.now() - thresholdMs) }
          }
        });
      }
    });
  }
}
