import { z } from 'zod';
import { Period, Metric } from '../../../../utils';
import prisma from '../../../../prisma';
import { getPaginationSchema } from '../../../util/validation';
import { NotFoundError } from '../../../errors';
import { RecordLeaderboardEntry } from '../record.types';

const inputSchema = z
  .object({
    id: z.number().int().positive(),
    period: z.nativeEnum(Period),
    metric: z.nativeEnum(Metric)
  })
  .merge(getPaginationSchema());

type FindGroupRecordsParams = z.infer<typeof inputSchema>;

async function findGroupRecords(payload: FindGroupRecordsParams): Promise<RecordLeaderboardEntry[]> {
  const params = inputSchema.parse(payload);

  // Fetch this group and all of its memberships
  const groupAndMemberships = await prisma.group.findFirst({
    where: { id: params.id },
    include: { memberships: { select: { playerId: true } } }
  });

  if (!groupAndMemberships) {
    throw new NotFoundError('Group not found.');
  }

  // Convert the memberships to an array of player IDs
  const playerIds = groupAndMemberships.memberships.map(m => m.playerId);

  if (playerIds.length === 0) {
    return [];
  }

  const records = await prisma.record.findMany({
    where: {
      playerId: { in: playerIds },
      period: params.period,
      metric: params.metric
    },
    include: { player: true },
    orderBy: [{ value: 'desc' }],
    take: params.limit,
    skip: params.offset
  });

  return records;
}

export { findGroupRecords };
