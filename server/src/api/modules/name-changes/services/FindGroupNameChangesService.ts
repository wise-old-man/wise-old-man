import prisma, { NameChangeStatus } from '../../../../prisma';
import { NotFoundError } from '../../../errors';
import { PaginationOptions } from '../../../util/validation';
import { NameChangeWithPlayer } from '../name-change.types';

async function findGroupNameChanges(
  groupId: number,
  pagination: PaginationOptions
): Promise<NameChangeWithPlayer[]> {
  // Fetch this group and all of its memberships
  const groupAndMemberships = await prisma.group.findFirst({
    where: { id: groupId },
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
    take: pagination.limit,
    skip: pagination.offset
  });

  return nameChanges as unknown as NameChangeWithPlayer[];
}

export { findGroupNameChanges };
