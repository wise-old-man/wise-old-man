import { isErrored } from '@attio/fetchable';
import { FlaggedPlayerReviewContextResponse } from '../../api/responses';
import prisma from '../../prisma';
import { DiscordBotEventType, dispatchDiscordBotEvent } from '../../services/discord.service';
import { JobHandler } from '../types/job-handler.type';

interface Payload {
  username: string;
  context: FlaggedPlayerReviewContextResponse;
}

export const DispatchPlayerFlaggedDiscordEventJobHandler: JobHandler<Payload> = {
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
};
