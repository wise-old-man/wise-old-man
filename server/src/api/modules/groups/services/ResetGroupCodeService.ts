import prisma from '../../../../prisma';
import * as cryptService from '../../../services/external/crypt.service';
import { NotFoundError } from '../../../errors';
import logger from '../../../util/logging';

async function resetGroupCode(groupId: number): Promise<{ newCode: string }> {
  const [code, hash] = await cryptService.generateVerification();

  try {
    await prisma.group.update({
      where: { id: groupId },
      data: { verificationHash: hash }
    });

    logger.moderation(`[Group:${groupId}] Code reset`);

    return { newCode: code };
  } catch (error) {
    // Failed to find group with that id
    throw new NotFoundError('Group not found.');
  }
}

export { resetGroupCode };
