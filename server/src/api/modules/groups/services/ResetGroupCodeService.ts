import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import prisma, { PrismaTypes } from '../../../../prisma';
import * as cryptService from '../../../../services/crypt.service';

export async function resetGroupCode(
  groupId: number
): AsyncResult<
  { newCode: string },
  | { code: 'GROUP_NOT_FOUND' }
  | { code: 'FAILED_TO_RESET_GROUP_CODE'; subError: unknown }
  | { code: 'FAILED_TO_GENERATE_VERIFICATION_CODE'; subError: unknown }
> {
  const generateVerificationResult = await cryptService.generateVerification();

  if (isErrored(generateVerificationResult)) {
    return errored({
      code: 'FAILED_TO_GENERATE_VERIFICATION_CODE',
      subError: generateVerificationResult.error
    });
  }

  const { code, hash } = generateVerificationResult.value;

  const updateResult = await fromPromise(
    prisma.group.update({
      where: {
        id: groupId
      },
      data: {
        verificationHash: hash
      }
    })
  );

  if (isErrored(updateResult)) {
    if (
      updateResult.error instanceof PrismaTypes.PrismaClientKnownRequestError &&
      updateResult.error.code === 'P2025'
    ) {
      return errored({ code: 'GROUP_NOT_FOUND' });
    }

    return errored({
      code: 'FAILED_TO_RESET_GROUP_CODE',
      subError: updateResult.error
    });
  }

  return complete({ newCode: code });
}
