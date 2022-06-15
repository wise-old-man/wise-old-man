import { z } from 'zod';
import prisma from '../../../../prisma';
import { CompetitionType } from '../../../../utils';
import { BadRequestError, NotFoundError } from '../../../errors';
import { isValidUsername, standardize } from '../../players/player.utils';
import * as playerServices from '../../players/player.services';

const inputSchema = z.object({
  id: z.number().positive(),
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

  const invalidUsernames = params.participants.filter(u => !isValidUsername(u));

  if (invalidUsernames && invalidUsernames.length > 0) {
    throw new BadRequestError(
      `Found ${invalidUsernames.length} invalid usernames: Names must be 1-12 characters long,
       contain no special characters, and/or contain no space at the beginning or end of the name.`,
      invalidUsernames
    );
  }

  const usernames = params.participants.map(standardize);
  const duplicateUsernames = [...new Set(usernames.filter(u => usernames.filter(iu => iu === u).length > 1))];

  if (duplicateUsernames && duplicateUsernames.length > 0) {
    throw new BadRequestError(`Found repeated usernames: [${duplicateUsernames.join(', ')}]`);
  }

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

  return { count };
}

export { addParticipants };
