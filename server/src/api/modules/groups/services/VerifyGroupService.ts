import { omit } from 'lodash';
import { z } from 'zod';
import prisma from '../../../../prisma';
import { NotFoundError } from '../../../errors';
import { GroupWithCount } from '../group.types';

const inputSchema = z.object({
  id: z.number().positive()
});

type VerifyGroupService = z.infer<typeof inputSchema>;

async function verifyGroup(payload: VerifyGroupService): Promise<GroupWithCount> {
  const params = inputSchema.parse(payload);

  try {
    const updatedGroup = await prisma.group.update({
      where: { id: params.id },
      data: { verified: true },
      include: {
        _count: {
          select: {
            memberships: true
          }
        }
      }
    });

    return {
      ...omit(updatedGroup, ['_count', 'verificationHash']),
      memberCount: updatedGroup._count.memberships
    };
  } catch (error) {
    // Failed to find group with that id
    throw new NotFoundError('Group not found.');
  }
}

export { verifyGroup };
