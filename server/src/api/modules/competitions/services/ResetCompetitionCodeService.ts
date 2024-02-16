import prisma from '../../../../prisma';
import * as cryptService from '../../../services/external/crypt.service';
import logger from '../../../util/logging';
import { BadRequestError, NotFoundError } from '../../../errors';

async function resetCompetitionCode(id: number): Promise<{ newCode: string }> {
  const competition = await prisma.competition.findFirst({
    where: { id }
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

  await prisma.competition.update({ where: { id }, data: { verificationHash: hash } });

  logger.moderation(`[Competition:${id}] Code reset`);

  return { newCode: code };
}

export { resetCompetitionCode };
