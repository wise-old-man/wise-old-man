import prisma from '../../../../prisma';
import { NotFoundError } from '../../../errors';
import { standardize } from '../player.utils';
import { PlayerArchiveWithPlayer } from '../player.types';

async function findPlayerArchives(username: string) {
  const archives = await prisma.playerArchive.findMany({
    where: {
      previousUsername: standardize(username),
      restoredAt: null
    },
    include: {
      player: true
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

  return archives as PlayerArchiveWithPlayer[];
}

export { findPlayerArchives };
