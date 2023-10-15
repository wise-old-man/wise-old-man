import { z } from 'zod';
import prisma from '../../../../prisma';
import { GroupRole } from '../../../../utils';
import logger from '../../../util/logging';
import { omit } from '../../../util/objects';
import { BadRequestError, ServerError } from '../../../errors';
import { ActivityType, MembershipWithPlayer } from '../group.types';
import { standardize } from '../../players/player.utils';
import * as groupEvents from '../group.events';

const inputSchema = z.object({
  id: z.number().positive(),
  username: z.string(),
  role: z.nativeEnum(GroupRole)
});

type ChangeMemberRoleService = z.infer<typeof inputSchema>;

async function changeMemberRole(payload: ChangeMemberRoleService): Promise<MembershipWithPlayer> {
  const params = inputSchema.parse(payload);

  const membership = await prisma.membership.findFirst({
    where: {
      groupId: params.id,
      player: { username: standardize(params.username) }
    }
  });

  if (!membership) {
    const group = await prisma.group.findFirst({
      where: { id: params.id }
    });

    if (group) {
      throw new BadRequestError(`${params.username} is not a member of ${group.name}.`);
    } else {
      throw new ServerError('Failed to change member role.');
    }
  }

  if (membership.role === params.role) {
    throw new BadRequestError(`${params.username} is already a ${membership.role}.`);
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
          role: params.role,
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

      const activity = await transaction.memberActivity.create({
        data: {
          groupId: membership.groupId,
          playerId: membership.playerId,
          type: ActivityType.CHANGED_ROLE,
          role: params.role
        }
      });

      groupEvents.onMembersRolesChanged([omit({ ...activity, previousRole: membership.role }, 'createdAt')]);

      return updatedMembership;
    })
    .catch(error => {
      logger.error('Failed to change member role', error);
      throw new ServerError('Failed to change member role.');
    });

  return result;
}

export { changeMemberRole };
