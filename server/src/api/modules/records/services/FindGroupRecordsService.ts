import { z } from 'zod';
import { Period, Metric } from '../../../../utils';
import prisma, { Record, modifyRecords } from '../../../../prisma';
import { PAGINATION_SCHEMA } from '../../../util/validation';
import { NotFoundError } from '../../../errors';

const inputSchema = z
  .object({
    id: z.number().int().positive(),
    period: z.nativeEnum(Period),
    metric: z.nativeEnum(Metric)
  })
  .merge(PAGINATION_SCHEMA);

type FindGroupRecordsParams = z.infer<typeof inputSchema>;

async function findGroupRecords(payload: FindGroupRecordsParams): Promise<Record[]> {
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

  const records = await prisma.record
    .findMany({
      where: {
        playerId: { in: playerIds },
        period: params.period,
        metric: params.metric
      },
      include: { player: true },
      orderBy: [{ value: 'desc' }],
      take: params.limit,
      skip: params.offset
    })
    .then(modifyRecords);

  return records;
}

export { findGroupRecords };
