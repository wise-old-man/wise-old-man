import { isErrored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import * as cryptService from '../../../../services/crypt.service';
import { NotFoundError } from '../../../errors';

/**
 * Generates or resets the competition verification code for a group.
 * This code allows creating group competitions without having full group admin access.
 */
async function generateCompetitionCode(groupId: number): Promise<{ competitionCode: string }> {
  const generateVerificationResult = await cryptService.generateVerification();

  if (isErrored(generateVerificationResult)) {
    throw generateVerificationResult.error.subError;
  }

  const { code, hash } = generateVerificationResult.value;

  try {
    await prisma.group.update({
      where: { id: groupId },
      data: { competitionVerificationHash: hash }
    });

    return { competitionCode: code };
  } catch (_error) {
    throw new NotFoundError('Group not found.');
  }
}

/**
 * Removes the competition verification code for a group.
 * After this, only the main verification code can be used to create group competitions.
 */
async function deleteCompetitionCode(groupId: number): Promise<{ message: string }> {
  try {
    await prisma.group.update({
      where: { id: groupId },
      data: { competitionVerificationHash: null }
    });

    return { message: 'Successfully deleted the competition code.' };
  } catch (_error) {
    throw new NotFoundError('Group not found.');
  }
}

export { generateCompetitionCode, deleteCompetitionCode };
