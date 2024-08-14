import prisma from '../../../../prisma';
import { NotFoundError } from '../../../errors';
import { omit } from '../../../util/objects';
import { CompetitionListItem } from '../competition.types';

async function toggleCompetitionVisibility(
  competitionId: number,
  visible: boolean
): Promise<CompetitionListItem> {
  try {
    const updatedCompetition = await prisma.competition.update({
      where: { id: competitionId },
      data: { visible },
      include: {
        _count: {
          select: {
            participations: true
          }
        }
      }
    });

    return {
      ...omit(updatedCompetition, '_count', 'verificationHash'),
      participantCount: updatedCompetition._count.participations
    };
  } catch (error) {
    // Failed to find competition with that id
    throw new NotFoundError('Competition not found.');
  }
}

export { toggleCompetitionVisibility };
