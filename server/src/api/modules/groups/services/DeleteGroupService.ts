import prisma, { Group } from '../../../../prisma';
import { ServerError } from '../../../errors';

async function deleteGroup(id: number): Promise<Group> {
  try {
    const deletedGroup = await prisma.group.delete({
      where: { id }
    });

    return deletedGroup;
  } catch (error) {
    throw new ServerError('Failed to delete group.');
  }
}

export { deleteGroup };
