import { isErrored } from '@attio/fetchable';
import prisma from '../../prisma';
import { DiscordBotEventType, dispatchDiscordBotEvent } from '../../services/discord.service';
import { Job } from '../job.class';
import { JobOptions } from '../types/job-options.type';

interface Payload {
  groupId: number;
  playerIds: number[];
}

export class DispatchMembersLeftDiscordEventJob extends Job<Payload> {
  static options: JobOptions = {
    backoff: {
      type: 'exponential',
      delay: 30_000
    }
  };

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

    const dispatchResult = await dispatchDiscordBotEvent(DiscordBotEventType.GROUP_MEMBERS_LEFT, {
      groupId: payload.groupId,
      players: players.map(p => ({
        displayName: p.displayName
      }))
    });

    if (isErrored(dispatchResult) && dispatchResult.error.code === 'FAILED_TO_SEND_DISCORD_BOT_EVENT') {
      // Throw an error to ensure the job fails and is retried
      throw dispatchResult.error;
    }
  }
}
