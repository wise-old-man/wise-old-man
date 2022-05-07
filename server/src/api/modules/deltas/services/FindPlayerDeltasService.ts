import { parsePeriodExpression } from '@wise-old-man/utils';
import { z } from 'zod';
import prisma, { Snapshot } from '../../../../prisma';
import { BadRequestError, NotFoundError } from '../../../errors';
import * as snapshotServices from '../../snapshots/snapshot.services';
import { PlayerDeltasArray, PlayerDeltasMap } from '../delta.types';
import { calculatePlayerDeltas, emptyPlayerDelta, flattenPlayerDeltas } from '../delta.utils';

const inputSchema = z
  .object({
    id: z.number().int().positive(),
    // These can be filtered by a period string (week, day, 2m3w6d)
    period: z.string().optional(),
    // or by a time range (min date and max date)
    minDate: z.date().optional(),
    maxDate: z.date().optional(),
    formatting: z.enum(['array', 'map']).default('map')
  })
  .refine(s => s.period || (s.maxDate && s.minDate), {
    message: 'Invalid period and start/end dates.'
  })
  .refine(s => !(s.minDate && s.maxDate && s.minDate >= s.maxDate), {
    message: 'Min date must be before the max date.'
  });

type FindPlayerDeltasParams = z.infer<typeof inputSchema>;

interface FindPlayerDeltasResult {
  startsAt: Date;
  endsAt: Date;
  data: PlayerDeltasArray | PlayerDeltasMap;
}

async function findPlayerDeltas(payload: FindPlayerDeltasParams): Promise<FindPlayerDeltasResult> {
  const params = inputSchema.parse(payload);

  const player = await prisma.player.findUnique({
    where: { id: params.id }
  });

  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  // Find the two snapshots at the edges of the period/dates
  const [startSnapshot, endSnapshot] = await findEdgeSnapshots(params);

  // Player was inactive during this period (no snapshots), return empty deltas
  if (!startSnapshot || !endSnapshot) {
    return { startsAt: null, endsAt: null, data: emptyPlayerDelta() };
  }

  const data = calculatePlayerDeltas(startSnapshot, endSnapshot, player);

  return {
    startsAt: startSnapshot.createdAt,
    endsAt: endSnapshot.createdAt,
    data: params.formatting === 'array' ? flattenPlayerDeltas(data) : data
  };
}

async function findEdgeSnapshots(params: FindPlayerDeltasParams): Promise<Snapshot[]> {
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
    snapshotServices.findPlayerSnapshot({
      id: params.id,
      minDate: startDate
    }),
    snapshotServices.findPlayerSnapshot({
      id: params.id,
      maxDate: endDate
    })
  ]);
}

export { findPlayerDeltas };
