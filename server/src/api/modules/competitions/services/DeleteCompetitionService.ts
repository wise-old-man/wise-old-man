import prisma, { Competition } from '../../../../prisma';
import { ServerError } from '../../../errors';

async function deleteCompetition(id: number): Promise<Competition> {
  try {
    const deletedCompetition = await prisma.competition.delete({
      where: { id }
    });

    return deletedCompetition;
  } catch (error) {
    throw new ServerError('Failed to delete competition.');
  }
}

export { deleteCompetition };
