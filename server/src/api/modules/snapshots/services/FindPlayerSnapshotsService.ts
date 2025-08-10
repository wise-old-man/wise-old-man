import prisma, { PrismaTypes } from '../../../../prisma';
import { Period, Snapshot } from '../../../../types';
import { parsePeriodExpression } from '../../../../utils/shared/parse-period-expression.util';
import { BadRequestError } from '../../../errors';
import { PaginationOptions } from '../../../util/validation';

async function findPlayerSnapshots(
  id: number,
  period?: Period | string,
  minDate?: Date,
  maxDate?: Date,
  pagination?: PaginationOptions
): Promise<Snapshot[]> {
  if (minDate && maxDate && minDate >= maxDate) {
    throw new BadRequestError('Min date must be before the max date.');
  }

  const dateQuery: PrismaTypes.SnapshotWhereInput = {};

  if (minDate && maxDate) {
    dateQuery.createdAt = {
      gte: minDate,
      lte: maxDate
    };
  } else if (period) {
    const parsedPeriod = parsePeriodExpression(period);

    if (!parsedPeriod) {
      throw new BadRequestError(`Invalid period: ${period}.`);
    }

    dateQuery.createdAt = {
      gte: new Date(Date.now() - parsedPeriod.durationMs),
      lte: new Date()
    };
  }

  const snapshots = await prisma.snapshot.findMany({
    where: { playerId: id, ...dateQuery },
    orderBy: { createdAt: 'desc' },
    take: pagination?.limit,
    skip: pagination?.offset
  });

  return snapshots;
}

export { findPlayerSnapshots };
