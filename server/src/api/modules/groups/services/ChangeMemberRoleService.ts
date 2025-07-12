import prisma from '../../../../prisma';
import logger from '../../../../services/logging.service';
import { GroupRole } from '../../../../utils';
import { BadRequestError, ServerError } from '../../../errors';
import { eventEmitter, EventType } from '../../../events';
import { standardize } from '../../players/player.utils';
import { ActivityType, MembershipWithPlayer } from '../group.types';

async function changeMemberRole(
  groupId: number,
  username: string,
  newRole: GroupRole
): Promise<MembershipWithPlayer> {
  const membership = await prisma.membership.findFirst({
    where: {
      groupId,
      player: { username: standardize(username) }
    }
  });

  if (!membership) {
    const group = await prisma.group.findFirst({
      where: { id: groupId }
    });

    if (group) {
      throw new BadRequestError(`${username} is not a member of ${group.name}.`);
    } else {
      throw new ServerError('Failed to change member role.');
    }
  }

  if (membership.role === newRole) {
    throw new BadRequestError(`${username} is already a ${membership.role}.`);
  }

  const result = await prisma
    .$transaction(async transaction => {
      const updatedMembership = await transaction.membership.update({
        where: {
          playerId_groupId: {
            playerId: membership.playerId,
            groupId: membership.groupId
          }
        },
        data: {
          role: newRole,
          group: {
            update: {
              updatedAt: new Date()
            }
          }
        },
        include: {
          player: true
        }
      });

      await transaction.memberActivity.create({
        data: {
          groupId: membership.groupId,
          playerId: membership.playerId,
          type: ActivityType.CHANGED_ROLE,
          role: newRole,
          previousRole: membership.role
        }
      });

      eventEmitter.emit(EventType.GROUP_MEMBERS_ROLES_CHANGED, {
        groupId: membership.groupId,
        members: [
          {
            playerId: membership.playerId,
            role: newRole,
            previousRole: membership.role
          }
        ]
      });

      return updatedMembership;
    })
    .catch(error => {
      logger.error('Failed to change member role', error);
      throw new ServerError('Failed to change member role.');
    });

  return result;
}

export { changeMemberRole };
