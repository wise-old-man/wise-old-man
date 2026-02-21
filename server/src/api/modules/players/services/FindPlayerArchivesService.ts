import prisma from '../../../../prisma';
import { Player, PlayerAnnotationType, PlayerArchive } from '../../../../types';
import { ForbiddenError, NotFoundError } from '../../../errors';
import { standardizeUsername } from '../player.utils';

async function findPlayerArchives(
  username: string
): Promise<Array<{ archive: PlayerArchive; player: Player }>> {
  const standardized = standardizeUsername(username);

  const player = await prisma.player.findFirst({
    where: {
      username: standardized
    },
    include: {
      annotations: true
    }
  });

  // TODO: refactor error handling
  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  if (player.annotations.some(a => a.type === PlayerAnnotationType.OPT_OUT)) {
    throw new ForbiddenError('Player has opted out.');
  }

  const archives = await prisma.playerArchive.findMany({
    where: {
      playerId: player.id,
      restoredAt: null
    },
    orderBy: { createdAt: 'desc' }
  });

  return archives.map(archive => ({ archive, player }));
}
export { findPlayerArchives };
