import prisma from '../../../../prisma';
import { NameChange, NameChangeStatus, PlayerAnnotationType } from '../../../../types';
import { ForbiddenError, NotFoundError } from '../../../errors';
import { standardizeUsername } from '../../players/player.utils';

export async function findPlayerNameChanges(username: string): Promise<NameChange[]> {
  // Query the database for all (approved) name changes of "playerId"
  const player = await prisma.player.findFirst({
    where: { username: standardizeUsername(username) },
    include: {
      nameChanges: {
        where: { status: NameChangeStatus.APPROVED },
        orderBy: { resolvedAt: 'desc' }
      },
      annotations: true
    }
  });

  // TODO: Refactor error handlign
  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  if (player.annotations.some(a => a.type === PlayerAnnotationType.OPT_OUT)) {
    throw new ForbiddenError('Player has opted out.');
  }

  return player.nameChanges as NameChange[];
}
