import prisma from '../../../../prisma';
import { CompetitionType } from '../../../../utils/shared/competition.utils';
import { BadRequestError, NotFoundError } from '../../../errors';
import { sanitizeTitle } from '../competition.utils';

async function removeTeams(id: number, teamNames: string[]): Promise<{ count: number }> {
  const competition = await prisma.competition.findFirst({
    where: { id }
  });

  if (!competition) {
    throw new NotFoundError('Competition not found.');
  }

  if (competition.type === CompetitionType.CLASSIC) {
    throw new BadRequestError('Cannot remove teams from a classic competition.');
  }

  const { count } = await prisma.participation.deleteMany({
    where: {
      competitionId: id,
      teamName: { in: teamNames.map(sanitizeTitle) }
    }
  });

  if (!count) {
    throw new BadRequestError('No players were removed from the competition.');
  }

  await prisma.competition.update({
    where: { id },
    data: { updatedAt: new Date() }
  });

  return { count };
}

export { removeTeams };
