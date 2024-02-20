import { z } from 'zod';
import prisma from '../../../../prisma';
import { BadRequestError, ServerError } from '../../../errors';
import logger from '../../../util/logging';
import * as groupEvents from '../group.events';
import { ActivityType } from '../group.types';
import { fetchGroupDetails } from './FetchGroupDetailsService';
import { findPlayers } from '../../players/services/FindPlayersService';

const inputSchema = z.object({
  id: z.number().int().positive(),
  usernames: z
    .array(z.string(), { invalid_type_error: "Parameter 'members' is not a valid array." })
    .nonempty({ message: 'Empty members list.' })
});

type RemoveMembersService = z.infer<typeof inputSchema>;

async function removeMembers(payload: RemoveMembersService): Promise<{ count: number }> {
  const params = inputSchema.parse(payload);

  const groupMemberIds = (await fetchGroupDetails({ id: params.id })).memberships.map(
    membership => membership.player.id
  );

  const toRemovePlayerIds = (await findPlayers({ usernames: params.usernames }))
    .map(p => p.id)
    .filter(id => groupMemberIds.includes(id));

  if (!toRemovePlayerIds || !toRemovePlayerIds.length) {
    throw new BadRequestError('None of the players given were members of that group.');
  }

  const newActivites = toRemovePlayerIds.map(playerId => {
    return {
      playerId,
      groupId: params.id,
      type: ActivityType.LEFT
    };
  });

  const removedCount = await prisma
    .$transaction(async transaction => {
      const { count } = await transaction.membership.deleteMany({
        where: {
          groupId: params.id,
          playerId: { in: toRemovePlayerIds }
        }
      });

      // This shouldn't ever happen since these get validated before entering the transaction,
      // but on the off chance that they do, throw a generic error to be caught by the catch block.
      if (count === 0) {
        throw new Error();
      }

      await transaction.group.update({
        where: { id: params.id },
        data: { updatedAt: new Date() }
      });

      await transaction.memberActivity.createMany({ data: newActivites });

      return count;
    })
    .catch(error => {
      logger.error('Failed to remove members', error);
      throw new ServerError('Failed to remove members');
    });

  groupEvents.onGroupUpdated(params.id);
  groupEvents.onMembersLeft(newActivites);

  logger.moderation(`[Group:${params.id}] (${toRemovePlayerIds}) removed`);

  return { count: removedCount };
}

export { removeMembers };
