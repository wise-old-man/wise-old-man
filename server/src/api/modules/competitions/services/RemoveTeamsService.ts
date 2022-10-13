import { z } from 'zod';
import prisma from '../../../../prisma';
import { CompetitionType } from '../../../../utils';
import logger from '../../../util/logging';
import { BadRequestError, NotFoundError } from '../../../errors';
import { sanitizeTitle } from '../competition.utils';

const inputSchema = z.object({
  id: z.number().positive(),
  teamNames: z
    .array(z.string({ invalid_type_error: 'All team names must be non-empty strings.' }), {
      invalid_type_error: "Parameter 'teamNames' is not a valid array.",
      required_error: "Parameter 'teamNames' is undefined."
    })
    .nonempty({ message: 'Empty team names list.' })
});

type RemoveTeamsParams = z.infer<typeof inputSchema>;

async function removeTeams(payload: RemoveTeamsParams): Promise<{ count: number }> {
  const params = inputSchema.parse(payload);

  const competition = await prisma.competition.findFirst({
    where: { id: params.id }
  });

  if (!competition) {
    throw new NotFoundError('Competition not found.');
  }

  if (competition.type === CompetitionType.CLASSIC) {
    throw new BadRequestError('Cannot remove teams from a classic competition.');
  }

  const { count } = await prisma.participation.deleteMany({
    where: {
      competitionId: params.id,
      teamName: { in: params.teamNames.map(sanitizeTitle) }
    }
  });

  if (!count) {
    throw new BadRequestError('No players were removed from the competition.');
  }

  logger.moderation(`[Competition:${params.id}] (${params.teamNames}) removed`);

  await prisma.competition.update({
    where: { id: params.id },
    data: { updatedAt: new Date() }
  });

  return { count };
}

export { removeTeams };
