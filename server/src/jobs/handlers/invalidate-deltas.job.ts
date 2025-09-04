import prisma from '../../prisma';
import { Period, PERIODS } from '../../types';
import { assertNever } from '../../utils/assert-never.util';
import { Job } from '../job.class';

export class InvalidateDeltasJob extends Job<unknown> {
  async execute() {
    for (const period of PERIODS) {
      await prisma.cachedDelta.deleteMany({
        where: {
          period,
          updatedAt: {
            lt: new Date(Date.now() - getMaxAge(period))
          }
        }
      });
    }
  }
}

function getMaxAge(period: Period) {
  switch (period) {
    case Period.FIVE_MIN:
      return 1000 * 60 * 60; // 1 hour
    case Period.DAY:
      return 1000 * 60 * 60 * 12; // 12 hours
    case Period.WEEK:
      return 1000 * 60 * 60 * 24 * 3; // 3 days
    case Period.MONTH:
      return 1000 * 60 * 60 * 24 * 7; // 7 days
    case Period.YEAR:
      return 1000 * 60 * 60 * 24 * 14; // 14 days
    default:
      return assertNever(period);
  }
}
