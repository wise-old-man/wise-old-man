import prisma from '../../prisma';
import { DiscordBotEventType, dispatchDiscordBotEvent } from '../../services/discord.service';
import { GroupRole } from '../../utils';
import { Job } from '../job.class';

interface Payload {
  groupId: number;
  members: Array<{
    playerId: number;
    role: GroupRole;
  }>;
}

export class DispatchMembersJoinedDiscordEventJob extends Job<Payload> {
  async execute(payload: Payload) {
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

    await dispatchDiscordBotEvent(DiscordBotEventType.GROUP_MEMBERS_JOINED, {
      groupId: payload.groupId,
      members: players.map(player => ({
        player,
        role: roleMap.get(player.id)!
      }))
    });
  }
}
