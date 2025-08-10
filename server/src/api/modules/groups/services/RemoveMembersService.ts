import prisma from '../../../../prisma';
import logger from '../../../../services/logging.service';
import { MemberActivityType } from '../../../../types';
import { BadRequestError, ServerError } from '../../../errors';
import { eventEmitter, EventType } from '../../../events';
import { standardize } from '../../players/player.utils';

async function removeMembers(groupId: number, members: string[]): Promise<{ count: number }> {
  const groupMemberIdAndRoles = await prisma.membership.findMany({
    where: { groupId },
    select: { playerId: true, role: true }
  });

  const groupMemberIds = groupMemberIdAndRoles.map(x => x.playerId);

  const groupMemberRoleLookup = new Map(groupMemberIdAndRoles.map(g => [g.playerId, g.role]));

  const playerIdsToRemove = (
    await prisma.player.findMany({
      where: {
        username: { in: members.map(standardize) }
      },
      select: {
        id: true
      },
      orderBy: {
        username: 'asc'
      }
    })
  )
    .map(p => p.id)
    .filter(id => groupMemberIds.includes(id));

  if (!playerIdsToRemove || !playerIdsToRemove.length) {
    throw new BadRequestError('None of the players given were members of that group.');
  }

  const newActivites = playerIdsToRemove.map(playerId => {
    return {
      playerId,
      groupId,
      type: MemberActivityType.LEFT,
      role: groupMemberRoleLookup.get(playerId) ?? null
    };
  });

  const removedCount = await prisma
    .$transaction(async transaction => {
      const { count } = await transaction.membership.deleteMany({
        where: {
          groupId,
          playerId: { in: playerIdsToRemove }
        }
      });

      // This shouldn't ever happen since these get validated before entering the transaction,
      // but on the off chance that they do, throw a generic error to be caught by the catch block.
      if (count === 0) {
        throw new Error();
      }

      await transaction.group.update({
        where: { id: groupId },
        data: { updatedAt: new Date() }
      });

      await transaction.memberActivity.createMany({ data: newActivites });

      return count;
    })
    .catch(error => {
      logger.error('Failed to remove members', error);
      throw new ServerError('Failed to remove members');
    });

  eventEmitter.emit(EventType.GROUP_UPDATED, { groupId });

  eventEmitter.emit(EventType.GROUP_MEMBERS_LEFT, {
    groupId,
    members: newActivites.map(n => ({
      playerId: n.playerId
    }))
  });

  return { count: removedCount };
}

export { removeMembers };
