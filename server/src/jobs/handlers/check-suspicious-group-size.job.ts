import { formatGroupResponse } from '../../api/responses';
import prisma from '../../prisma';
import { DiscordBotEventType, dispatchDiscordBotEvent } from '../../services/discord.service';
import { JobHandler } from '../types/job-handler.type';

interface Payload {
  groupId: number;
}

export const CheckSuspiciousGroupSizeJobHandler: JobHandler<Payload> = {
  generateUniqueJobId(payload) {
    return payload.groupId.toString();
  },

  async execute({ groupId }) {
    const memberCount = await prisma.membership.count({
      where: {
        groupId
      }
    });

    if (memberCount < 600) {
      return;
    }

    const group = await prisma.group.findFirst({
      where: {
        id: groupId
      }
    });

    if (group === null || group.creatorIpHash === null) {
      return;
    }

    await prisma.group.update({
      where: {
        id: group.id
      },
      data: {
        visible: false
      }
    });
    
    await dispatchDiscordBotEvent(DiscordBotEventType.CREATION_SPAM_WARNING, {
      creatorIpHash: group.creatorIpHash,
      type: 'suspicious-size' as const,
      groups: [
        {
          group: formatGroupResponse(group, memberCount),
          reason: `Group has ${memberCount} members (sus).`
        }
      ],
      competitions: []
    });
  }
};
