import prisma, { Competition, PrismaTypes } from '../../../../prisma';
import { NotFoundError, ServerError } from '../../../errors';

async function deleteCompetition(id: number): Promise<Competition> {
  try {
    const deletedCompetition = await prisma.competition.delete({
      where: { id }
    });

    return deletedCompetition;
  } catch (error) {
    if (error instanceof PrismaTypes.PrismaClientKnownRequestError && error.code === 'P2025') {
      // Failed to find competition with that id
      throw new NotFoundError('Competition not found.');
    }

    throw new ServerError('Failed to delete competition.');
  }
}

export { deleteCompetition };
