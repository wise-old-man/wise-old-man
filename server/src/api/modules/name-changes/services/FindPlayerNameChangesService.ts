import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { NameChange, NameChangeStatus, PlayerAnnotationType } from '../../../../types';
import { standardizeUsername } from '../../players/player.utils';

async function findPlayerNameChanges(
  username: string
): AsyncResult<NameChange[], { code: 'PLAYER_NOT_FOUND' } | { code: 'PLAYER_OPTED_OUT' }> {
  const player = await prisma.player.findFirst({
    where: { username: standardizeUsername(username) },
    include: { annotations: true }
  });

  if (!player) {
    return errored({ code: 'PLAYER_NOT_FOUND' });
  }

  if (player.annotations.some(a => a.type === PlayerAnnotationType.OPT_OUT)) {
    return errored({ code: 'PLAYER_OPTED_OUT' });
  }

  const [nameChanges, playerArchives] = await Promise.all([
    prisma.nameChange.findMany({
      where: {
        player: {
          username: standardizeUsername(username)
        },
        status: NameChangeStatus.APPROVED
      },
      orderBy: {
        resolvedAt: 'desc'
      }
    }),
    prisma.playerArchive.findMany({
      where: {
        player: {
          username: standardizeUsername(username)
        }
      }
    })
  ]);

  const archiveUsernames = playerArchives.map(a => a.archiveUsername);

  const filteredNameChanges = nameChanges.filter(
    nameChange => !archiveUsernames.includes(nameChange.oldName)
  );

  return complete(filteredNameChanges as NameChange[]);
}

export { findPlayerNameChanges };
