import prisma, { Player } from '../../../../prisma';
import { Period, PeriodProps } from '../../../../utils';
import { NotFoundError, BadRequestError } from '../../../errors';
import { jobManager, JobType } from '../../../jobs';

async function updateAllMembers(groupId: number): Promise<number> {
  const outdatedPlayers = await getOutdatedMembers(groupId);

  if (!outdatedPlayers || outdatedPlayers.length === 0) {
    const group = await prisma.group.findFirst({
      where: { id: groupId }
    });

    if (!group) {
      throw new NotFoundError('Group not found.');
    }

    throw new BadRequestError('This group has no outdated members (updated over 24h ago).');
  }

  // Execute the update action for every member
  outdatedPlayers.forEach(({ username }) => {
    jobManager.add({ type: JobType.UPDATE_PLAYER, payload: { username } });
  });

  return outdatedPlayers.length;
}

/**
 * Get outdated members (IDs) of a specific group id.
 * A member is considered outdated 24 hours after their last update.
 */
async function getOutdatedMembers(groupId: number): Promise<Pick<Player, 'username'>[]> {
  const dayAgo = new Date(Date.now() - PeriodProps[Period.DAY].milliseconds);

  const outdatedMembers = await prisma.membership.findMany({
    where: {
      groupId,
      player: {
        OR: [{ updatedAt: { lt: dayAgo } }, { updatedAt: null }]
      }
    },
    include: {
      player: { select: { username: true } }
    }
  });

  return outdatedMembers.map(o => o.player);
}

export { updateAllMembers };
