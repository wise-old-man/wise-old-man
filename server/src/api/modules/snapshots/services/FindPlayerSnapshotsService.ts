import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma, { PrismaTypes } from '../../../../prisma';
import { Period, PlayerAnnotationType, Snapshot, Player } from '../../../../types';
import { parsePeriodExpression } from '../../../../utils/shared/parse-period-expression.util';
import { BadRequestError } from '../../../errors';
import { PaginationOptions } from '../../../util/validation';
import { standardizeUsername } from '../../players/player.utils';

async function findPlayerSnapshots(
  username: string,
  period?: Period | string,
  minDate?: Date,
  maxDate?: Date,
  pagination?: PaginationOptions
): AsyncResult<
  { snapshots: Snapshot[]; player: Player },
  { code: 'PLAYER_NOT_FOUND' } | { code: 'PLAYER_OPTED_OUT' }
> {
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

  const player = await prisma.player.findFirst({
    where: { username: standardizeUsername(username) },
    include: { annotations: true }
  });

  if (player == null) {
    return errored({ code: 'PLAYER_NOT_FOUND' });
  }

  if (player.annotations.some(a => a.type === PlayerAnnotationType.OPT_OUT)) {
    return errored({ code: 'PLAYER_OPTED_OUT' });
  }

  const snapshots = await prisma.snapshot.findMany({
    where: { playerId: player.id, ...dateQuery },
    orderBy: { createdAt: 'desc' },
    take: pagination?.limit,
    skip: pagination?.offset
  });

  return complete({ snapshots, player });
}

export { findPlayerSnapshots };
