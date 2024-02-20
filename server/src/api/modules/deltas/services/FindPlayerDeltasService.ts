import prisma, { Snapshot } from '../../../../prisma';
import { Period, parsePeriodExpression } from '../../../../utils';
import { BadRequestError, NotFoundError } from '../../../errors';
import { PlayerDeltasArray, PlayerDeltasMap } from '../delta.types';
import { calculatePlayerDeltas, emptyPlayerDelta, flattenPlayerDeltas } from '../delta.utils';
import { findPlayerSnapshot } from '../../snapshots/services/FindPlayerSnapshotService';
import { standardize } from '../../players/player.utils';

export interface FindPlayerDeltasResult {
  startsAt: Date;
  endsAt: Date;
  data: PlayerDeltasArray | PlayerDeltasMap;
}

async function findPlayerDeltas(
  username: string,
  period?: Period | string,
  minDate?: Date,
  maxDate?: Date,
  formatting?: 'array' | 'map'
): Promise<FindPlayerDeltasResult> {
  if (!period && (!minDate || !maxDate)) {
    throw new BadRequestError('Invalid period and start/end dates.');
  }

  if (minDate && maxDate && minDate >= maxDate) {
    throw new BadRequestError('Min date must be before the max date.');
  }

  const player = await prisma.player.findFirst({
    where: { username: standardize(username) }
  });

  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  // Find the two snapshots at the edges of the period/dates
  const [startSnapshot, endSnapshot] = await findEdgeSnapshots(player.id, period, minDate, maxDate);

  // Player was inactive during this period (no snapshots), return empty deltas
  if (!startSnapshot || !endSnapshot) {
    return {
      startsAt: null,
      endsAt: null,
      data: formatting === 'array' ? flattenPlayerDeltas(emptyPlayerDelta()) : emptyPlayerDelta()
    };
  }

  const data = calculatePlayerDeltas(startSnapshot, endSnapshot, player);

  return {
    startsAt: startSnapshot.createdAt,
    endsAt: endSnapshot.createdAt,
    data: formatting === 'array' ? flattenPlayerDeltas(data) : data
  };
}

async function findEdgeSnapshots(
  playerId: number,
  period?: Period | string,
  minDate?: Date,
  maxDate?: Date
): Promise<Snapshot[]> {
  const getEdgeDates = () => {
    if (period) {
      const parsedPeriod = parsePeriodExpression(period);

      if (!parsedPeriod) {
        throw new BadRequestError(`Invalid period: ${period}.`);
      }

      return { startDate: new Date(Date.now() - parsedPeriod.durationMs), endDate: new Date() };
    }

    if (minDate && maxDate) {
      return { startDate: minDate, endDate: maxDate };
    }
  };

  const { startDate, endDate } = getEdgeDates();

  return await Promise.all([
    findPlayerSnapshot({ id: playerId, minDate: startDate }),
    findPlayerSnapshot({ id: playerId, maxDate: endDate })
  ]);
}

export { findPlayerDeltas };
