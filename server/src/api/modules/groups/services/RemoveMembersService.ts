import prisma from '../../../../prisma';
import { BadRequestError, ServerError } from '../../../errors';
import logger from '../../../util/logging';
import { standardize } from '../../players/player.utils';
import * as groupEvents from '../group.events';
import { ActivityType } from '../group.types';

async function removeMembers(groupId: number, members: string[]): Promise<{ count: number }> {
  const groupMemberIdAndRoles = await prisma.membership.findMany({
    where: { groupId },
    select: { playerId: true, role: true }
  });

  const groupMemberIds = groupMemberIdAndRoles.map(x => x.playerId);

  const groupMemberRoleLookup = groupMemberIdAndRoles.reduce((acc, obj) => {
    acc[obj.playerId] = obj;
    return acc;
  }, {});

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
      type: ActivityType.LEFT,
      role: groupMemberRoleLookup[playerId]
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

  groupEvents.onGroupUpdated(groupId);
  groupEvents.onMembersLeft(newActivites);

  logger.moderation(`[Group:${groupId}] (${playerIdsToRemove}) removed`);

  return { count: removedCount };
}

export { removeMembers };
