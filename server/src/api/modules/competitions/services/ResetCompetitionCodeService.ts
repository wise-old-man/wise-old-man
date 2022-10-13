import { z } from 'zod';
import prisma from '../../../../prisma';
import * as cryptService from '../../../services/external/crypt.service';
import logger from '../../../util/logging';
import { BadRequestError, NotFoundError } from '../../../errors';

const inputSchema = z.object({
  id: z.number().positive()
});

type ResetCompetitionCodeParams = z.infer<typeof inputSchema>;

async function resetCompetitionCode(payload: ResetCompetitionCodeParams): Promise<{ newCode: string }> {
  const params = inputSchema.parse(payload);

  const competition = await prisma.competition.findFirst({
    where: { id: params.id }
  });

  if (!competition) {
    throw new NotFoundError('Competition not found.');
  }

  if (competition.groupId) {
    throw new BadRequestError(
      'Cannot reset competition codes for group competitions. Please reset the group code instead.'
    );
  }

  const [code, hash] = await cryptService.generateVerification();

  await prisma.competition.update({ where: { id: params.id }, data: { verificationHash: hash } });

  logger.moderation(`[Competition:${params.id}] Code reset`);

  return { newCode: code };
}

export { resetCompetitionCode };
