import { isErrored } from '@attio/fetchable';
import prisma from '../../prisma';
import { DiscordBotEventType, dispatchDiscordBotEvent } from '../../services/discord.service';
import { GroupRole } from '../../types';
import { JobHandler } from '../types/job-handler.type';

interface Payload {
  groupId: number;
  members: Array<{
    playerId: number;
    role: GroupRole;
  }>;
}

export const DispatchMembersJoinedDiscordEventJobHandler: JobHandler<Payload> = {
  options: {
    backoff: {
      type: 'exponential',
      delay: 30_000
    }
  },

  async execute(payload) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const players = await prisma.player.findMany({
      where: {
        id: {
          in: payload.members.map(m => m.playerId)
        }
      }
    });

    if (players.length === 0) {
      return;
    }

    const roleMap = new Map(payload.members.map(m => [m.playerId, m.role]));

    const dispatchResult = await dispatchDiscordBotEvent(DiscordBotEventType.GROUP_MEMBERS_JOINED, {
      groupId: payload.groupId,
      members: players.map(player => ({
        player: {
          displayName: player.displayName
        },
        role: roleMap.get(player.id)!
      }))
    });

    if (isErrored(dispatchResult) && dispatchResult.error.code === 'FAILED_TO_SEND_DISCORD_BOT_EVENT') {
      // Throw an error to ensure the job fails and is retried
      throw dispatchResult.error;
    }
  }
};
