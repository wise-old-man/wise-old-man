import { z } from 'zod';
import { omit } from '../../../util/objects';
import { Metric, parsePeriodExpression } from '../../../../utils';
import prisma, { Player, Snapshot } from '../../../../prisma';
import { getPaginationSchema } from '../../../util/validation';
import { BadRequestError, NotFoundError } from '../../../errors';
import * as snapshotServices from '../../snapshots/snapshot.services';
import { calculateMetricDelta } from '../delta.utils';
import { DeltaGroupLeaderboardEntry } from '../delta.types';

const inputSchema = z
  .object({
    id: z.number().int().positive(),
    metric: z.nativeEnum(Metric),
    // These can be filtered by a period string (week, day, 2m3w6d)
    period: z.string().optional(),
    // or by a time range (min date and max date)
    minDate: z.date().optional(),
    maxDate: z.date().optional()
  })
  .merge(getPaginationSchema(100_000)) // unlimited "max" limit
  .refine(s => s.period || (s.maxDate && s.minDate), {
    message: 'Invalid period and start/end dates.'
  })
  .refine(s => !(s.minDate && s.maxDate && s.minDate >= s.maxDate), {
    message: 'Min date must be before the max date.'
  });

type FindGroupDeltasParams = z.infer<typeof inputSchema>;

async function findGroupDeltas(payload: FindGroupDeltasParams): Promise<DeltaGroupLeaderboardEntry[]> {
  const params = inputSchema.parse(payload);

  // Fetch this group and all of its memberships
  const groupAndMemberships = await prisma.group.findFirst({
    where: { id: params.id },
    include: {
      memberships: {
        select: {
          player: {
            include: {
              // If fetching by period (not custom time range), the "end" snapshots will always be
              // the player's latest snapshots. So it's cheaper to just pull them from the latestSnapshotId relation
              latestSnapshot: !!params.period
            }
          }
        }
      }
    }
  });

  if (!groupAndMemberships) {
    throw new NotFoundError('Group not found.');
  }

  const playerSnapshotMap = await buildPlayerSnapshotMap(
    groupAndMemberships.memberships.map(m => m.player),
    params
  );

  const results = Array.from(playerSnapshotMap.keys())
    .map(playerId => {
      const { player, startSnapshot, endSnapshot } = playerSnapshotMap.get(playerId);

      if (!player || !startSnapshot || !endSnapshot) {
        return null;
      }

      const data = calculateMetricDelta(player, params.metric, startSnapshot, endSnapshot);

      return {
        player: omit(player, 'latestSnapshot'),
        data,
        startDate: startSnapshot.createdAt,
        endDate: endSnapshot.createdAt
      };
    })
    .filter(r => r !== null)
    .sort((a, b) => b.data.gained - a.data.gained)
    .slice(params.offset, params.offset + params.limit);

  return results;
}

type PlayerMapValue = {
  player: Player & { latestSnapshot?: Snapshot };
  startSnapshot: Snapshot | null;
  endSnapshot: Snapshot | null;
};

async function buildPlayerSnapshotMap(
  players: Array<Player & { latestSnapshot?: Snapshot }>,
  params: FindGroupDeltasParams
) {
  const playerIds = players.map(p => p.id);

  let startSnapshots: Snapshot[];
  let endSnapshots: Snapshot[];

  if (params.period) {
    startSnapshots = await findStartingSnapshots(playerIds, params.period);
    endSnapshots = players.map(p => p.latestSnapshot).filter(Boolean);
  } else {
    const [start, end] = await findEdgeSnapshots(playerIds, params.minDate, params.maxDate);
    startSnapshots = start;
    endSnapshots = end;
  }

  const playerMap = new Map<number, PlayerMapValue>(
    players.map(p => [p.id, { player: p, startSnapshot: null, endSnapshot: null }])
  );

  startSnapshots.forEach(s => {
    const current = playerMap.get(s.playerId);
    if (current) current.startSnapshot = s;
  });

  endSnapshots.forEach(s => {
    const current = playerMap.get(s.playerId);
    if (current) current.endSnapshot = s;
  });

  return playerMap;
}

async function findEdgeSnapshots(playerIds: number[], minDate: Date, maxDate: Date) {
  return await Promise.all([
    snapshotServices.findGroupSnapshots({ playerIds, minDate }),
    snapshotServices.findGroupSnapshots({ playerIds, maxDate })
  ]);
}

async function findStartingSnapshots(playerIds: number[], period: string) {
  const parsedPeriod = parsePeriodExpression(period);

  if (!parsedPeriod) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  return await snapshotServices.findGroupSnapshots({
    playerIds,
    minDate: new Date(Date.now() - parsedPeriod.durationMs)
  });
}

export { findGroupDeltas };
