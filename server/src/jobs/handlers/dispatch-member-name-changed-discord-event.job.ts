import { isErrored } from '@attio/fetchable';
import prisma from '../../prisma';
import { DiscordBotEventType, dispatchDiscordBotEvent } from '../../services/discord.service';
import { Job } from '../job.class';
import { JobOptions } from '../types/job-options.type';

interface Payload {
  username: string;
  previousDisplayName: string;
}

export class DispatchMemberNameChangedDiscordEventJob extends Job<Payload> {
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
      const dispatchResult = await dispatchDiscordBotEvent(DiscordBotEventType.MEMBER_NAME_CHANGED, {
        groupId,
        player,
        previousName: payload.previousDisplayName
      });

      if (isErrored(dispatchResult) && dispatchResult.error.code === 'FAILED_TO_SEND_DISCORD_BOT_EVENT') {
        // Throw an error to ensure the job fails and is retried
        throw dispatchResult.error;
      }
    }
  }
}
