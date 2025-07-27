import prisma from '../../../../prisma';
import { NameChange, NameChangeStatus, Player } from '../../../../types';
import { NotFoundError } from '../../../errors';
import { PaginationOptions } from '../../../util/validation';

async function findGroupNameChanges(
  groupId: number,
  pagination: PaginationOptions
): Promise<Array<NameChange & { player: Player }>> {
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

  return nameChanges as Array<NameChange & { player: Player }>;
}

export { findGroupNameChanges };
