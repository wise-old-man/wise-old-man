import { z } from 'zod';
import { Metric, parsePeriodExpression } from '../../../../utils';
import prisma, { Snapshot, modifyPlayer } from '../../../../prisma';
import { PAGINATION_SCHEMA } from '../../../util/validation';
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
  .merge(PAGINATION_SCHEMA)
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
    include: { memberships: { select: { player: true } } }
  });

  if (!groupAndMemberships) {
    throw new NotFoundError('Group not found.');
  }

  const players = groupAndMemberships.memberships.map(m => modifyPlayer(m.player));

  // Find the snapshots at the edges of the period/dates (for each player)
  const [startSnapshots, endSnapshots] = await findEdgeSnapshots(
    params,
    players.map(p => p.id)
  );

  const playerMap = Object.fromEntries(
    players.map(p => [p.id, { player: p, startSnapshot: null, endSnapshot: null }])
  );

  startSnapshots.forEach(s => {
    if (s.playerId in playerMap) playerMap[s.playerId].startSnapshot = s;
  });

  endSnapshots.forEach(e => {
    if (e.playerId in playerMap) playerMap[e.playerId].endSnapshot = e;
  });

  const results = Object.keys(playerMap)
    .map(playerId => {
      const { player, startSnapshot, endSnapshot } = playerMap[playerId];
      if (!player || !startSnapshot || !endSnapshot) return null;

      const data = calculateMetricDelta(player, params.metric, startSnapshot, endSnapshot);

      return {
        player,
        startDate: startSnapshot.createdAt as Date,
        endDate: endSnapshot.createdAt as Date,
        data,
        gained: data.gained, // TODO: delete this soon
        playerId: Number(player.id) // TODO: delete this soon
      };
    })
    .filter(r => r !== null)
    .sort((a, b) => b.data.gained - a.data.gained)
    .slice(params.offset, params.offset + params.limit);

  return results;
}

async function findEdgeSnapshots(params: FindGroupDeltasParams, playerIds: number[]): Promise<Snapshot[][]> {
  const getEdgeDates = () => {
    if (params.period) {
      const parsedPeriod = parsePeriodExpression(params.period);

      if (!parsedPeriod) {
        throw new BadRequestError(`Invalid period: ${params.period}.`);
      }

      return { startDate: new Date(Date.now() - parsedPeriod.durationMs), endDate: new Date() };
    }

    if (params.minDate && params.maxDate) {
      return { startDate: params.minDate, endDate: params.maxDate };
    }
  };

  const { startDate, endDate } = getEdgeDates();

  return await Promise.all([
    snapshotServices.findGroupSnapshots({ playerIds, minDate: startDate }),
    snapshotServices.findGroupSnapshots({ playerIds, maxDate: endDate })
  ]);
}

export { findGroupDeltas };
