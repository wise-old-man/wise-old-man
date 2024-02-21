import prisma from '../../../../prisma';
import { BadRequestError, ServerError } from '../../../errors';
import logger from '../../../util/logging';
import * as groupEvents from '../group.events';
import { ActivityType } from '../group.types';
import { findPlayers } from '../../players/services/FindPlayersService';

async function removeMembers(groupId: number, members: string[]): Promise<{ count: number }> {
  const groupMemberIds = (
    await prisma.membership.findMany({
      where: { groupId },
      select: { playerId: true }
    })
  ).map(membership => membership.playerId);

  const toRemovePlayerIds = (await findPlayers({ usernames: members }))
    .map(p => p.id)
    .filter(id => groupMemberIds.includes(id));

  if (!toRemovePlayerIds || !toRemovePlayerIds.length) {
    throw new BadRequestError('None of the players given were members of that group.');
  }

  const newActivites = toRemovePlayerIds.map(playerId => {
    return {
      playerId,
      groupId,
      type: ActivityType.LEFT
    };
  });

  const removedCount = await prisma
    .$transaction(async transaction => {
      const { count } = await transaction.membership.deleteMany({
        where: {
          groupId,
          playerId: { in: toRemovePlayerIds }
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

  logger.moderation(`[Group:${groupId}] (${toRemovePlayerIds}) removed`);

  return { count: removedCount };
}

export { removeMembers };
