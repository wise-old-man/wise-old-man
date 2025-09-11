import prisma from '../../../../prisma';
import { Group } from '../../../../types';
import { NotFoundError } from '../../../errors';
import { eventEmitter, EventType } from '../../../events';

async function verifyGroup(groupId: number): Promise<{
  group: Group;
  memberCount: number;
}> {
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
      group: updatedGroup,
      memberCount: updatedGroup._count.memberships
    };
  } catch (_error) {
    // Failed to find group with that id
    throw new NotFoundError('Group not found.');
  }
}

export { verifyGroup };
