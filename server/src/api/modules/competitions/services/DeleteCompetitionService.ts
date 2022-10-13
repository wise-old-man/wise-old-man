import { z } from 'zod';
import prisma, { Competition } from '../../../../prisma';
import { ServerError } from '../../../errors';
import logger from '../../../util/logging';

const inputSchema = z.object({
  id: z.number().positive()
});

type DeleteCompetitionParams = z.infer<typeof inputSchema>;

async function deleteCompetition(payload: DeleteCompetitionParams): Promise<Competition> {
  const params = inputSchema.parse(payload);

  try {
    const deletedCompetition = await prisma.competition.delete({
      where: { id: params.id }
    });

    logger.moderation(`[Competition:${params.id}] Deleted`);

    return deletedCompetition;
  } catch (error) {
    throw new ServerError('Failed to delete competition.');
  }
}

export { deleteCompetition };
