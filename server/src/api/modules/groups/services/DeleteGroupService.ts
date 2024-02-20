import prisma, { Group } from '../../../../prisma';
import { ServerError } from '../../../errors';
import logger from '../../../util/logging';

async function deleteGroup(id: number): Promise<Group> {
  try {
    const deletedGroup = await prisma.group.delete({
      where: { id }
    });

    logger.moderation(`[Group:${id}] Deleted`);

    return deletedGroup;
  } catch (error) {
    throw new ServerError('Failed to delete group.');
  }
}

export { deleteGroup };
