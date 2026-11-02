import { AsyncResult, complete, errored, isErrored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import * as cryptService from '../../../../services/crypt.service';

export async function resetCompetitionCode(
  id: number
): AsyncResult<
  { newCode: string },
  | { code: 'COMPETITION_NOT_FOUND' }
  | { code: 'CANNOT_RESET_GROUP_COMPETITION_CODE' }
  | { code: 'FAILED_TO_GENERATE_VERIFICATION_CODE'; subError: unknown }
> {
  const competition = await prisma.competition.findFirst({
    where: { id }
  });

  if (competition === null) {
    return errored({ code: 'COMPETITION_NOT_FOUND' });
  }

  if (competition.groupId) {
    return errored({ code: 'CANNOT_RESET_GROUP_COMPETITION_CODE' });
  }

  const generateVerificationResult = await cryptService.generateVerification();

  if (isErrored(generateVerificationResult)) {
    return errored({
      code: 'FAILED_TO_GENERATE_VERIFICATION_CODE',
      subError: generateVerificationResult.error
    });
  }

  const { code, hash } = generateVerificationResult.value;

  await prisma.competition.update({
    where: { id },
    data: { verificationHash: hash }
  });

  return complete({ newCode: code });
}
