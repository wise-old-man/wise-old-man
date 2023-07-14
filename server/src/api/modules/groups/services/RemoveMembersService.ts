import { z } from 'zod';
import prisma from '../../../../prisma';
import { ServerError, BadRequestError } from '../../../errors';
import logger from '../../../util/logging';
import * as playerServices from '../../players/player.services';
import { fetchGroupDetails } from './FetchGroupDetailsService';

const inputSchema = z.object({
  id: z.number().positive(),
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

  const toRemovePlayerIds = (await playerServices.findPlayers({ usernames: params.usernames }))
    .map(p => p.id)
    .filter(id => groupMemberIds.includes(id));

  if (!toRemovePlayerIds || !toRemovePlayerIds.length) {
    throw new BadRequestError('None of the players given were members of that group.');
  }

  const { count } = await prisma.membership.deleteMany({
    where: {
      groupId: params.id,
      playerId: { in: toRemovePlayerIds }
    }
  });

  if (!count) {
    throw new BadRequestError('None of the players given were members of that group.');
  }

  try {
    await prisma.group.update({
      where: { id: params.id },
      data: { updatedAt: new Date() }
    });
  } catch (error) {
    throw new ServerError('Failed to remove members.');
  }

  logger.moderation(`[Group:${params.id}] (${toRemovePlayerIds}) removed`);

  return { count };
}

export { removeMembers };
