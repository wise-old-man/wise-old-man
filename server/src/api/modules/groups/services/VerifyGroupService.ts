import prisma from '../../../../prisma';
import { NotFoundError } from '../../../errors';
import { omit } from '../../../util/objects';
import { GroupListItem } from '../group.types';
import { eventEmitter, EventType } from '../../../events';

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

    eventEmitter.emit(EventType.GROUP_UPDATED, { groupId });

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
