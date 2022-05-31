import { z } from 'zod';
import prisma, { modifyPlayer } from '../../../../prisma';
import { GroupRole } from '../../../../utils';
import { BadRequestError, NotFoundError } from '../../../errors';
import { MembershipWithPlayer } from '../group.types';
import { standardize } from '../../players/player.utils';

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
      throw new NotFoundError('Group not found.');
    }
  }

  if (membership.role === params.role) {
    throw new BadRequestError(`${params.username} is already a ${membership.role}.`);
  }

  const updatedMembership = await prisma.membership.update({
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

  return { ...updatedMembership, player: modifyPlayer(updatedMembership.player) };
}

export { changeMemberRole };
