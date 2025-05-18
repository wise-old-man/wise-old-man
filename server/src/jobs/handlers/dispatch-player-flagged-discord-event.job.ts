import { DiscordBotEventType, dispatchDiscordBotEvent } from '../../services/discord.service';
import prisma from '../../prisma';
import { Job } from '../job.class';
import { FlaggedPlayerReviewContext } from '../../utils';

interface Payload {
  username: string;
  context: FlaggedPlayerReviewContext;
}

export class DispatchPlayerFlaggedDiscordEventJob extends Job<Payload> {
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

    await dispatchDiscordBotEvent(DiscordBotEventType.PLAYER_FLAGGED_REVIEW, {
      player,
      flagContext: payload.context
    });
  }
}
