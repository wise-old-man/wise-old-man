import prisma from '../../../../prisma';
import { NameChange, NameChangeStatus, PlayerAnnotationType } from '../../../../types';
import { NotFoundError } from '../../../errors';
import { standardize } from '../../players/player.utils';

async function findPlayerNameChanges(username: string): Promise<NameChange[]> {
  // Query the database for all (approved) name changes of "playerId"
  const nameChanges = await prisma.nameChange.findMany({
    where: {
      player: {
        username: standardize(username),
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
  });

  if (nameChanges.length === 0) {
    const player = await prisma.player.findFirst({
      where: { username: standardize(username) }
    });

    if (!player) {
      throw new NotFoundError('Player not found.');
    }
  }

  return nameChanges as NameChange[];
}

export { findPlayerNameChanges };
