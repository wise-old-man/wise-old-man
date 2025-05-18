import { DiscordBotEventType, dispatchDiscordBotEvent } from '../../services/discord.service';
import prisma from '../../prisma';
import { Job } from '../job.class';

interface Payload {
  username: string;
}

export class DispatchMemberHcimDiedDiscordEventJob extends Job<Payload> {
  async execute(payload: Payload) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const player = await prisma.player.findFirst({
      where: {
        username: payload.username
      }
    });

    if (player === null) {
      return;
    }

    const memberships = await prisma.membership.findMany({
      where: {
        playerId: player.id
      }
    });

    // The following actions are only relevant to players that are group members
    if (memberships.length === 0) {
      return;
    }

    for (const { groupId } of memberships) {
      await dispatchDiscordBotEvent(DiscordBotEventType.MEMBER_HCIM_DIED, {
        groupId,
        player
      });
    }
  }
}
