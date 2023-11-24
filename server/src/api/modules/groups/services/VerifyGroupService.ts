import { z } from 'zod';
import prisma from '../../../../prisma';
import { NotFoundError } from '../../../errors';
import { omit } from '../../../util/objects';
import logger from '../../../util/logging';
import { GroupListItem } from '../group.types';
import { onGroupUpdated } from '../group.events';

const inputSchema = z.object({
  id: z.number().positive()
});

type VerifyGroupService = z.infer<typeof inputSchema>;

async function verifyGroup(payload: VerifyGroupService): Promise<GroupListItem> {
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

    logger.moderation(`[Group:${params.id}] Verified`);

    onGroupUpdated(params.id);

    return {
      ...omit(updatedGroup, '_count', 'verificationHash'),
      memberCount: updatedGroup._count.memberships
    };
  } catch (error) {
    // Failed to find group with that id
    throw new NotFoundError('Group not found.');
  }
}

export { verifyGroup };
