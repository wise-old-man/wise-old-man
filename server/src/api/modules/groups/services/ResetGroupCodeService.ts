import { isErrored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import * as cryptService from '../../../../services/crypt.service';
import { NotFoundError } from '../../../errors';

async function resetGroupCode(groupId: number): Promise<{ newCode: string }> {
  const generateVerificationResult = await cryptService.generateVerification();

  if (isErrored(generateVerificationResult)) {
    // TODO: When this file returns a fetchable, stop throwing here and just return the error
    throw generateVerificationResult.error.subError;
  }

  const { code, hash } = generateVerificationResult.value;

  try {
    await prisma.group.update({
      where: { id: groupId },
      data: { verificationHash: hash }
    });

    return { newCode: code };
  } catch (_error) {
    // Failed to find group with that id
    throw new NotFoundError('Group not found.');
  }
}

export { resetGroupCode };
