import { z } from 'zod';
import prisma, { modifyPlayer } from '../../../../prisma';
import { GroupRole } from '../../../../utils';
import { BadRequestError, ServerError } from '../../../errors';
import { MembershipWithPlayer } from '../group.types';
import { standardize } from '../../players/player.utils';
import { ActivityType } from '../../../../prisma/enum-adapter';
import logger from '../../../util/logging';
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

      await transaction.memberActivity
        .create({
          data: {
            groupId: membership.groupId,
            playerId: membership.playerId,
            type: ActivityType.CHANGED_ROLE,
            role: params.role,
            createdAt: new Date()
          }
        })
        .then(newMemberActivity => {
          groupEvents.onMemberRoleChanged(newMemberActivity, membership.role);
        });

      return {
        ...updatedMembership,
        player: modifyPlayer(updatedMembership.player)
      };
    })
    .catch(error => {
      logger.error('Failed to change member role', error);
      throw new ServerError('Failed to change member role.');
    });

  return result;
}

export { changeMemberRole };
