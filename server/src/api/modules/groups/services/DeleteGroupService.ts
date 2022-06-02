import { z } from 'zod';
import prisma, { Group } from '../../../../prisma';
import { ServerError } from '../../../errors';

const inputSchema = z.object({
  id: z.number().positive()
});

type DeleteGroupParams = z.infer<typeof inputSchema>;

async function deleteGroup(payload: DeleteGroupParams): Promise<Group> {
  const params = inputSchema.parse(payload);

  try {
    const deletedGroup = await prisma.group.delete({
      where: { id: params.id }
    });

    return deletedGroup;
  } catch (error) {
    throw new ServerError('Failed to delete group.');
  }
}

export { deleteGroup };
