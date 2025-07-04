import { isErrored } from '@attio/fetchable';
import prisma from '../../prisma';
import { DiscordBotEventType, dispatchDiscordBotEvent } from '../../services/discord.service';
import { Job } from '../job.class';
import { JobOptions } from '../types/job-options.type';
import { fetchCompetitionDetails } from '../../api/modules/competitions/services/FetchCompetitionDetailsService';

interface Payload {
  competitionId: number;
}

export class DispatchCompetitionEndedDiscordEventJob extends Job<Payload> {
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

    const competitionDetails = await fetchCompetitionDetails(payload.competitionId);

    // Map the competition's end standings
    const standings = competitionDetails.participations
      .filter(p => p.progress.gained > 0)
      .map(p => ({ displayName: p.player.displayName, teamName: p.teamName, gained: p.progress.gained }));

    const dispatchResult = await dispatchDiscordBotEvent(DiscordBotEventType.COMPETITION_ENDED, {
      groupId: competition.groupId,
      competition,
      standings
    });

    if (isErrored(dispatchResult) && dispatchResult.error.code === 'FAILED_TO_SEND_DISCORD_BOT_EVENT') {
      // Throw an error to ensure the job fails and is retried
      throw dispatchResult.error;
    }
  }
}
