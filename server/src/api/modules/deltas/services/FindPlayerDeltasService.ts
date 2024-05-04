import prisma from '../../../../prisma';
import { Period, parsePeriodExpression } from '../../../../utils';
import { BadRequestError, NotFoundError } from '../../../errors';
import { PlayerDeltasMap } from '../delta.types';
import { calculatePlayerDeltas, emptyPlayerDelta } from '../delta.utils';
import { standardize } from '../../players/player.utils';

export interface FindPlayerDeltasResult {
  startsAt: Date | null;
  endsAt: Date | null;
  data: PlayerDeltasMap;
}

async function findPlayerDeltas(
  username: string,
  period?: Period | string,
  minDate?: Date,
  maxDate?: Date
): Promise<FindPlayerDeltasResult> {
  if (!period && (!minDate || !maxDate)) {
    throw new BadRequestError('Invalid period and start/end dates.');
  }

  if (minDate && maxDate && minDate >= maxDate) {
    throw new BadRequestError('Min date must be before the max date.');
  }

  const player = await prisma.player.findFirst({
    where: {
      username: standardize(username)
    },
    include: {
      // If fetching by period (not custom time range), the "end" snapshots will always be
      // the player's latest snapshots. So it's cheaper to just pull them from the latestSnapshotId relation
      latestSnapshot: !!period
    }
  });

  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  const startSnapshot = await prisma.snapshot.findFirst({
    where: {
      playerId: player.id,
      createdAt: { gte: parseStartDate(period, minDate) }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  let endSnapshot = player.latestSnapshot;

  // If couldn't get the end snapshot via db joins, fetch it explicitly
  if (!endSnapshot) {
    endSnapshot = await prisma.snapshot.findFirst({
      where: {
        playerId: player.id,
        createdAt: period ? undefined : { lte: maxDate }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Player was inactive during this period (no snapshots), return empty deltas
  if (!startSnapshot || !endSnapshot) {
    return {
      startsAt: null,
      endsAt: null,
      data: emptyPlayerDelta()
    };
  }

  const data = calculatePlayerDeltas(startSnapshot, endSnapshot, player);

  return {
    startsAt: startSnapshot.createdAt,
    endsAt: endSnapshot.createdAt,
    data
  };
}

function parseStartDate(period: Period | string | undefined, minDate?: Date): Date {
  if (period) {
    const parsedPeriod = parsePeriodExpression(period);

    if (!parsedPeriod) {
      throw new BadRequestError(`Invalid period: ${period}.`);
    }

    return new Date(Date.now() - parsedPeriod.durationMs);
  }

  if (!minDate) {
    throw new BadRequestError('Invalid period and start/end dates.');
  }

  return minDate;
}

export { findPlayerDeltas };
