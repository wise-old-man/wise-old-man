import { isErrored } from '@attio/fetchable';
import { formatCompetitionResponse } from '../../api/responses';
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
      },
      include: {
        _count: {
          select: {
            participations: true
          }
        },
        group: {
          include: {
            _count: {
              select: {
                memberships: true
              }
            }
          }
        },
        metrics: {
          where: {
            deletedAt: null
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    if (competition === null || competition.groupId === null) {
      return;
    }

    const competitionResponse = formatCompetitionResponse(
      {
        ...competition,
        participantCount: competition._count.participations
      },
      competition.group === null
        ? null
        : {
            ...competition.group,
            memberCount: competition.group?._count.memberships
          }
    );

    const dispatchResult = await dispatchDiscordBotEvent(DiscordBotEventType.COMPETITION_ENDING, {
      groupId: competition.groupId,
      competition: competitionResponse,
      minutesLeft: payload.minutesLeft
    });

    if (isErrored(dispatchResult) && dispatchResult.error.code === 'FAILED_TO_SEND_DISCORD_BOT_EVENT') {
      // Throw an error to ensure the job fails and is retried
      throw dispatchResult.error;
    }
  }
}
