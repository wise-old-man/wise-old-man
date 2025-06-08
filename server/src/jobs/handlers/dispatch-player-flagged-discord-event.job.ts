import { DiscordBotEventType, dispatchDiscordBotEvent } from '../../services/discord.service';
import prisma from '../../prisma';
import { Job } from '../job.class';
import { FlaggedPlayerReviewContext } from '../../utils';
import { isErrored } from '@attio/fetchable';
import { JobOptions } from '../types/job-options.type';

interface Payload {
  username: string;
  context: FlaggedPlayerReviewContext;
}

export class DispatchPlayerFlaggedDiscordEventJob extends Job<Payload> {
  static options: JobOptions = {
    attempts: 3,
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

    const dispatchResult = await dispatchDiscordBotEvent(DiscordBotEventType.PLAYER_FLAGGED_REVIEW, {
      player,
      flagContext: payload.context
    });

    if (isErrored(dispatchResult) && dispatchResult.error.code === 'FAILED_TO_SEND_DISCORD_BOT_EVENT') {
      // Throw an error to ensure the job fails and is retried
      throw dispatchResult.error;
    }
  }
}
