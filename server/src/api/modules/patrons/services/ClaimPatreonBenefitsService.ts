import prisma, { Patron } from '../../../../prisma';
import { JobType, jobManager } from '../../../jobs';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../errors';
import { standardize } from '../../players/player.utils';

async function claimPatreonBenefits(
  discordId: string,
  username: string | undefined,
  groupId: number | undefined
): Promise<Patron> {
  if (!username && !groupId) {
    throw new BadRequestError('Username and/or groupId must be provided.');
  }

  const patronage = await prisma.patron.findFirst({
    where: { discordId }
  });

  if (!patronage) {
    throw new NotFoundError('No patronage found for this discordId.');
  }

  if (patronage.tier !== 2 && groupId) {
    throw new ForbiddenError('You must be a tier 2 patron to claim group benefits.');
  }

  let playerId;

  if (username) {
    const player = await prisma.player.findFirst({
      where: { username: standardize(username) }
    });

    if (!player) {
      throw new NotFoundError('Player not found.');
    }

    playerId = player.id;
  }

  if (groupId) {
    const group = await prisma.group.findFirst({
      where: { id: groupId }
    });

    if (!group) {
      throw new NotFoundError('Group not found.');
    }
  }

  const updatedPatron = await prisma.patron.update({
    where: {
      id: patronage.id
    },
    data: {
      groupId,
      playerId
    }
  });

  jobManager.add({ type: JobType.SYNC_PATRONS });

  return updatedPatron;
}

export { claimPatreonBenefits };
