import prisma from '../../../../prisma';
import { CompetitionType } from '../../../../utils';
import logger from '../../../util/logging';
import { BadRequestError, NotFoundError } from '../../../errors';
import * as playerServices from '../../players/player.services';
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
  const players = await playerServices.findPlayers({
    usernames: participants,
    createIfNotFound: true
  });

  const newPlayers = existingIds.length === 0 ? players : players.filter(p => !existingIds.includes(p.id));

  if (!newPlayers || !newPlayers.length) {
    throw new BadRequestError('All players given are already competing.');
  }

  const { count } = await prisma.participation.createMany({
    data: newPlayers.map(p => ({ playerId: p.id, competitionId: id }))
  });

  await prisma.competition.update({
    where: { id },
    data: { updatedAt: new Date() }
  });

  logger.moderation(`[Competition:${id}] (${newPlayers.map(p => p.id)}) joined`);

  return { count };
}

export { addParticipants };
