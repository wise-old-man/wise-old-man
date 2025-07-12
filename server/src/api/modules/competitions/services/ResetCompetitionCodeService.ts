import { isErrored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import * as cryptService from '../../../../services/crypt.service';
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

  const generateVerificationResult = await cryptService.generateVerification();

  if (isErrored(generateVerificationResult)) {
    // TODO: When this file returns a fetchable, stop throwing here and just return the error
    throw generateVerificationResult.error.subError;
  }

  const { code, hash } = generateVerificationResult.value;

  await prisma.competition.update({
    where: { id },
    data: { verificationHash: hash }
  });

  return { newCode: code };
}

export { resetCompetitionCode };
