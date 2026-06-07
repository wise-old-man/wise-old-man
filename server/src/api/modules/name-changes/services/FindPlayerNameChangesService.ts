import prisma from '../../../../prisma';
import { NameChange, NameChangeStatus, PlayerAnnotationType } from '../../../../types';
import { NotFoundError } from '../../../errors';
import { standardizeUsername } from '../../players/player.utils';

async function findPlayerNameChanges(username: string): Promise<NameChange[]> {
  const [nameChanges, playerArchives] = await Promise.all([
    prisma.nameChange.findMany({
      where: {
        player: {
          username: standardizeUsername(username),
          annotations: {
            none: {
              type: PlayerAnnotationType.OPT_OUT
            }
          }
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

  if (filteredNameChanges.length === 0) {
    const player = await prisma.player.findFirst({
      where: { username: standardizeUsername(username) }
    });

    if (!player) {
      throw new NotFoundError('Player not found.');
    }
  }

  return filteredNameChanges as NameChange[];
}

export { findPlayerNameChanges };
