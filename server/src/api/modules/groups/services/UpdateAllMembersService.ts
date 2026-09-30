import { AsyncResult, complete, errored } from '@attio/fetchable';
import ms from 'ms';
import { jobManager, JobType } from '../../../../jobs';
import prisma from '../../../../prisma';
import { Player } from '../../../../types';

const GRACE_PERIOD = ms('30 min');

export async function updateAllMembers(
  groupId: number
): AsyncResult<number, { code: 'GROUP_NOT_FOUND' } | { code: 'NO_OUTDATED_MEMBERS' }> {
  const outdatedPlayers = await getOutdatedMembers(groupId);

  if (outdatedPlayers.length === 0) {
    const group = await prisma.group.findFirst({
      where: { id: groupId }
    });

    if (group === null) {
      return errored({ code: 'GROUP_NOT_FOUND' });
    }

    return errored({ code: 'NO_OUTDATED_MEMBERS' });
  }

  // Schedule an update job for every member
  for (const player of outdatedPlayers) {
    jobManager.add(JobType.UPDATE_PLAYER, { username: player.username });
  }

  return complete(outdatedPlayers.length);
}

/**
 * Get outdated members (IDs) of a specific group id.
 * A member is considered outdated 24 hours after their last update.
 */
async function getOutdatedMembers(groupId: number): Promise<Pick<Player, 'username'>[]> {
  const threshold = new Date(Date.now() - ms('1 day') + GRACE_PERIOD);

  const outdatedMembers = await prisma.membership.findMany({
    where: {
      groupId,
      player: {
        OR: [{ updatedAt: { lt: threshold } }, { updatedAt: null }]
      }
    },
    include: {
      player: { select: { username: true } }
    }
  });

  return outdatedMembers.map(o => o.player);
}
