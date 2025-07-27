import prisma from '../../../../prisma';
import { PlayerArchive } from '../../../../types';
import { NotFoundError } from '../../../errors';
import { standardize } from '../player.utils';

async function findPlayerArchives(username: string): Promise<Array<PlayerArchive>> {
  const archives = await prisma.playerArchive.findMany({
    where: {
      previousUsername: standardize(username),
      restoredAt: null
    },
    orderBy: { createdAt: 'desc' }
  });

  if (archives.length === 0) {
    const player = await prisma.player.findFirst({
      where: {
        username: standardize(username)
      }
    });

    if (!player) {
      throw new NotFoundError('Player not found.');
    }
  }

  return archives;
}

export { findPlayerArchives };
