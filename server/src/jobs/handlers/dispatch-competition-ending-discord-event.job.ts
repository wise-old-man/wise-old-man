import { isErrored } from '@attio/fetchable';
import prisma from '../../prisma';
import { DiscordBotEventType, dispatchDiscordBotEvent } from '../../services/discord.service';
import { Job } from '../job.class';
import { JobOptions } from '../types/job-options.type';

interface Payload {
  competitionId: number;
  minutesLeft: number;
}

export class DispatchCompetitionEndingDiscordEventJob extends Job<Payload> {
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

    const competition = await prisma.competition.findFirst({
      where: {
        id: payload.competitionId
      }
    });

    if (competition === null || competition.groupId === null) {
      return;
    }

    const dispatchResult = await dispatchDiscordBotEvent(DiscordBotEventType.COMPETITION_ENDING, {
      groupId: competition.groupId,
      competition,
      minutesLeft: payload.minutesLeft
    });

    if (isErrored(dispatchResult) && dispatchResult.error.code === 'FAILED_TO_SEND_DISCORD_BOT_EVENT') {
      // Throw an error to ensure the job fails and is retried
      throw dispatchResult.error;
    }
  }
}
