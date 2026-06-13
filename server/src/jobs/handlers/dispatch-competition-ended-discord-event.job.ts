import { isErrored } from '@attio/fetchable';
import { fetchCompetitionDetails } from '../../api/modules/competitions/services/FetchCompetitionDetailsService';
import { formatCompetitionResponse } from '../../api/responses';
import prisma from '../../prisma';
import { DiscordBotEventType, dispatchDiscordBotEvent } from '../../services/discord.service';
import { JobHandler } from '../types/job-handler.type';

interface Payload {
  competitionId: number;
}

export const DispatchCompetitionEndedDiscordEventJobHandler: JobHandler<Payload> = {
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

    const competition = await prisma.competition.findFirst({
      where: {
        id: payload.competitionId
      }
    });

    if (competition === null || competition.groupId === null) {
      return;
    }

    const { group, metrics, participations, sortingMetricIndex } = await fetchCompetitionDetails(
      payload.competitionId
    );

    // Map the competition's end standings
    const standings = participations
      .filter(p => p.deltas[sortingMetricIndex].values.gained > 0)
      .map(p => ({
        displayName: p.player.displayName,
        teamName: p.participation.teamName,
        gained: p.deltas[sortingMetricIndex].values.gained
      }));

    const competitionResponse = formatCompetitionResponse(
      {
        ...competition,
        metrics,
        participantCount: participations.length
      },
      group
    );

    const dispatchResult = await dispatchDiscordBotEvent(DiscordBotEventType.COMPETITION_ENDED, {
      groupId: competition.groupId,
      competition: competitionResponse,
      standings
    });

    if (isErrored(dispatchResult) && dispatchResult.error.code === 'FAILED_TO_SEND_DISCORD_BOT_EVENT') {
      // Throw an error to ensure the job fails and is retried
      throw dispatchResult.error;
    }
  }
};
