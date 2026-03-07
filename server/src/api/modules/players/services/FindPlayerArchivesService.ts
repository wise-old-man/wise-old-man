import prisma from '../../../../prisma';
import { Player, PlayerAnnotationType, PlayerArchive } from '../../../../types';
import { ForbiddenError, NotFoundError } from '../../../errors';
import { standardizeUsername } from '../player.utils';

export async function findPlayerArchives(
  username: string
): Promise<Array<{ archive: PlayerArchive; player: Player }>> {
  const player = await prisma.player.findFirst({
    where: { username: standardizeUsername(username) },
    include: {
      archives: {
        where: { restoredAt: null },
        orderBy: { createdAt: 'desc' }
      },
      annotations: true
    }
  });

  // TODO: Refactor error handling
  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  if (player.annotations.some(a => a.type === PlayerAnnotationType.OPT_OUT)) {
    throw new ForbiddenError('Player has opted out.');
  }

  return player.archives.map(archive => ({
    archive,
    player
  }));
}
