import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { NameChange, NameChangeStatus, Player, PlayerAnnotationType } from '../../../../types';
import { PaginationOptions } from '../../../util/validation';

export async function findGroupNameChanges(
  groupId: number,
  pagination: PaginationOptions
): AsyncResult<
  Array<{
    nameChange: NameChange;
    player: Player;
  }>,
  { code: 'GROUP_NOT_FOUND' }
> {
  const groupAndMemberships = await prisma.group.findFirst({
    where: { id: groupId },
    include: { memberships: { select: { playerId: true } } }
  });

  if (groupAndMemberships === null) {
    return errored({ code: 'GROUP_NOT_FOUND' });
  }

  if (groupAndMemberships.memberships.length === 0) {
    return complete([]);
  }

  // Fetch all name changes for these player IDs
  const nameChanges = await prisma.nameChange.findMany({
    where: {
      playerId: {
        in: groupAndMemberships.memberships.map(m => m.playerId)
      },
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

  return complete(
    nameChanges.map(({ player, ...nameChange }) => ({
      nameChange: nameChange as NameChange,
      player
    }))
  );
}
