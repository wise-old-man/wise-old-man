import prisma from '../../prisma';
import { DiscordBotEventType, dispatchDiscordBotEvent } from '../../services/discord.service';
import { Job } from '../job.class';

interface Payload {
  groupId: number;
  playerIds: number[];
}

export class DispatchMembersLeftDiscordEventJob extends Job<Payload> {
  async execute(payload: Payload) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const players = await prisma.player.findMany({
      where: {
        id: {
          in: payload.playerIds
        }
      }
    });

    if (players.length === 0) {
      return;
    }

    await dispatchDiscordBotEvent(DiscordBotEventType.GROUP_MEMBERS_LEFT, {
      groupId: payload.groupId,
      players
    });
  }
}
