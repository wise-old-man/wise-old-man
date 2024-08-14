import prisma from '../../../../prisma';
import { NotFoundError } from '../../../errors';
import { omit } from '../../../util/objects';
import { GroupListItem } from '../group.types';
import { onGroupUpdated } from '../group.events';

async function toggleGroupVisibility(groupId: number, visible: boolean): Promise<GroupListItem> {
  try {
    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: { visible },
      include: {
        _count: {
          select: {
            memberships: true
          }
        }
      }
    });

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

export { toggleGroupVisibility };
