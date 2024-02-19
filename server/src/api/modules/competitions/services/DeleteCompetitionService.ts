import prisma, { Competition } from '../../../../prisma';
import { ServerError } from '../../../errors';
import logger from '../../../util/logging';

async function deleteCompetition(id: number): Promise<Competition> {
  try {
    const deletedCompetition = await prisma.competition.delete({
      where: { id }
    });

    logger.moderation(`[Competition:${id}] Deleted`);

    return deletedCompetition;
  } catch (error) {
    throw new ServerError('Failed to delete competition.');
  }
}

export { deleteCompetition };
