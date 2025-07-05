import prisma from '../../../../prisma';
import { CompetitionType, PlayerAnnotationType } from '../../../../utils';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../errors';
import { findOrCreatePlayers } from '../../players/services/FindOrCreatePlayersService';
import { onParticipantsJoined } from '../competition.events';
import { validateInvalidParticipants, validateParticipantDuplicates } from '../competition.utils';

async function addParticipants(id: number, participants: string[]): Promise<{ count: number }> {
  const competition = await prisma.competition.findFirst({
    where: { id }
  });

  if (!competition) {
    throw new NotFoundError('Competition not found.');
  }

  if (competition.type === CompetitionType.TEAM) {
    throw new BadRequestError('Cannot add participants to a team competition.');
  }

  // throws an error if any participant is invalid
  validateInvalidParticipants(participants);
  // throws an error if any participant is duplicated
  validateParticipantDuplicates(participants);

  // Find all existing participants' ids
  const existingIds = (
    await prisma.participation.findMany({
      where: { competitionId: id },
      select: { playerId: true }
    })
  ).map(p => p.playerId);

  // Find or create all players with the given usernames
  const players = await findOrCreatePlayers(participants);

  const newPlayers = existingIds.length === 0 ? players : players.filter(p => !existingIds.includes(p.id));

  if (!newPlayers || !newPlayers.length) {
    throw new BadRequestError('All players given are already competing.');
  }

  const optOuts = await prisma.playerAnnotation.findMany({
    where: {
      playerId: {
        in: newPlayers.map(p => p.id)
      },
      type: {
        in: [PlayerAnnotationType.OPT_OUT, PlayerAnnotationType.OPT_OUT_COMPETITIONS]
      }
    },
    include: {
      player: {
        select: { displayName: true }
      }
    }
  });

  if (optOuts.length > 0) {
    throw new ForbiddenError(
      'One or more players have opted out of joining competitions, so they cannot be added as participants.',
      optOuts.map(o => o.player.displayName)
    );
  }

  const newParticipations = newPlayers.map(p => ({ playerId: p.id, competitionId: id }));

  const { count } = await prisma.participation.createMany({
    data: newParticipations
  });

  if (newParticipations.length > 0) {
    onParticipantsJoined(newParticipations);
  }

  await prisma.competition.update({
    where: { id },
    data: { updatedAt: new Date() }
  });

  return { count };
}

export { addParticipants };
