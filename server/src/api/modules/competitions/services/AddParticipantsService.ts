import { z } from 'zod';
import prisma from '../../../../prisma';
import { CompetitionType } from '../../../../utils';
import logger from '../../../util/logging';
import { BadRequestError, NotFoundError } from '../../../errors';
import * as playerServices from '../../players/player.services';
import { validateInvalidParticipants, validateParticipantDuplicates } from '../competition.utils';

const inputSchema = z.object({
  id: z.number().int().positive(),
  participants: z
    // Allowing "any" so that we could do better error messages below
    .array(z.string().or(z.any()).optional(), {
      invalid_type_error: "Parameter 'participants' is not a valid array.",
      required_error: "Parameter 'participants' is undefined."
    })
    .nonempty({ message: 'Empty participants list.' })
});

type AddParticipantsParams = z.infer<typeof inputSchema>;

async function addParticipants(payload: AddParticipantsParams): Promise<{ count: number }> {
  const params = inputSchema.parse(payload);

  const competition = await prisma.competition.findFirst({
    where: { id: params.id }
  });

  if (!competition) {
    throw new NotFoundError('Competition not found.');
  }

  if (competition.type === CompetitionType.TEAM) {
    throw new BadRequestError('Cannot add participants to a team competition.');
  }

  // throws an error if any participant is invalid
  validateInvalidParticipants(params.participants);
  // throws an error if any participant is duplicated
  validateParticipantDuplicates(params.participants);

  // Find all existing participants' ids
  const existingIds = (
    await prisma.participation.findMany({
      where: { competitionId: params.id },
      select: { playerId: true }
    })
  ).map(p => p.playerId);

  // Find or create all players with the given usernames
  const players = await playerServices.findPlayers({
    usernames: params.participants,
    createIfNotFound: true
  });

  const newPlayers = existingIds.length === 0 ? players : players.filter(p => !existingIds.includes(p.id));

  if (!newPlayers || !newPlayers.length) {
    throw new BadRequestError('All players given are already competing.');
  }

  const { count } = await prisma.participation.createMany({
    data: newPlayers.map(p => ({ playerId: p.id, competitionId: params.id }))
  });

  await prisma.competition.update({
    where: { id: params.id },
    data: { updatedAt: new Date() }
  });

  logger.moderation(`[Competition:${params.id}] (${newPlayers.map(p => p.id)}) joined`);

  return { count };
}

export { addParticipants };
