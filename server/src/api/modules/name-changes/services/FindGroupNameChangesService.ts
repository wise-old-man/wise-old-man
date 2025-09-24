import prisma from '../../../../prisma';
import { NameChange, NameChangeStatus, Player, PlayerAnnotationType } from '../../../../types';
import { NotFoundError } from '../../../errors';
import { PaginationOptions } from '../../../util/validation';

async function findGroupNameChanges(
  groupId: number,
  pagination: PaginationOptions
): Promise<Array<{ nameChange: NameChange; player: Player }>> {
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

  // Fetch all name changes for these player IDs
  const nameChanges = await prisma.nameChange.findMany({
    where: {
      playerId: { in: playerIds },
      status: NameChangeStatus.APPROVED,
      player: {
        annotations: {
          none: {
            type: PlayerAnnotationType.OPT_OUT
          }
        }
      }
    },
    include: { player: true },
    orderBy: { createdAt: 'desc' },
    take: pagination.limit,
    skip: pagination.offset
  });

  return nameChanges.map(({ player, ...nameChange }) => ({
    nameChange: nameChange as NameChange,
    player
  }));
}

export { findGroupNameChanges };
