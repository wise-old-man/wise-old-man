import prisma from '../../../../prisma';
import { NotFoundError } from '../../../errors';
import { omit } from '../../../util/objects';
import logger from '../../../util/logging';
import { GroupListItem } from '../group.types';
import { onGroupUpdated } from '../group.events';

async function verifyGroup(groupId: number): Promise<GroupListItem> {
  try {
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: { verified: true },
      include: {
        _count: {
          select: {
            memberships: true
          }
        }
      }
    });

    logger.moderation(`[Group:${groupId}] Verified`);

    onGroupUpdated(groupId);

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
