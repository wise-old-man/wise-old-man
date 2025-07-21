import prisma, { PrismaTypes } from '../../../../prisma';
import { Group } from '../../../../types';
import { NotFoundError, ServerError } from '../../../errors';

async function deleteGroup(id: number): Promise<Group> {
  try {
    const deletedGroup = await prisma.group.delete({
      where: { id }
    });

    return deletedGroup as Group;
  } catch (error) {
    if (error instanceof PrismaTypes.PrismaClientKnownRequestError && error.code === 'P2025') {
      // Failed to find group with that id
      throw new NotFoundError('Group not found.');
    }

    throw new ServerError('Failed to delete group.');
  }
}

export { deleteGroup };
