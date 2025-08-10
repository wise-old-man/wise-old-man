import prisma from '../../../../prisma';
import { Player, PlayerArchive } from '../../../../types';
import { NotFoundError } from '../../../errors';
import { standardize } from '../player.utils';

async function findPlayerArchives(
  username: string
): Promise<Array<{ archive: PlayerArchive; player: Player }>> {
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

  return archives.map(({ player, ...archive }) => ({ archive, player }));
}

export { findPlayerArchives };
