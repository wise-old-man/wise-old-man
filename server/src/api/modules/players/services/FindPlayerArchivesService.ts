import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { Player, PlayerAnnotationType, PlayerArchive } from '../../../../types';
import { standardizeUsername } from '../player.utils';

export async function findPlayerArchives(
  username: string
): AsyncResult<
  Array<{ archive: PlayerArchive; player: Player }>,
  { code: 'PLAYER_NOT_FOUND' } | { code: 'PLAYER_OPTED_OUT' }
> {
  const player = await prisma.player.findFirst({
    where: { username: standardizeUsername(username) },
    include: {
      annotations: true
    }
  });

  if (!player) {
    return errored({ code: 'PLAYER_NOT_FOUND' });
  }

  if (player.annotations.some(a => a.type === PlayerAnnotationType.OPT_OUT)) {
    return errored({ code: 'PLAYER_OPTED_OUT' });
  }

  const archives = await prisma.playerArchive.findMany({
    where: {
      previousUsername: standardizeUsername(username),
      restoredAt: null
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return complete(
    archives.map(archive => ({
      archive,
      player
    }))
  );
}
