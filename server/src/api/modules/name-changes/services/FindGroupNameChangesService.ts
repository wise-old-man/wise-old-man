import { z } from 'zod';
import prisma, { NameChange, NameChangeStatus, Player } from '../../../../prisma';
import { NotFoundError } from '../../../errors';
import { PAGINATION_SCHEMA } from '../../../util/validation';

const inputSchema = z
  .object({
    id: z.number().int().positive()
  })
  .merge(PAGINATION_SCHEMA);

type FindGroupNameChangesParams = z.infer<typeof inputSchema>;

async function findGroupNameChanges(payload: FindGroupNameChangesParams): Promise<NameChange[]> {
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

  // Fetch all achievements for these player IDs
  const nameChanges = await prisma.nameChange.findMany({
    where: {
      playerId: { in: playerIds },
      status: NameChangeStatus.APPROVED
    },
    include: { player: true },
    orderBy: { createdAt: 'desc' },
    take: params.limit,
    skip: params.offset
  });

  return nameChanges as unknown as Array<NameChange & { player: Player }>;
}

export { findGroupNameChanges };
