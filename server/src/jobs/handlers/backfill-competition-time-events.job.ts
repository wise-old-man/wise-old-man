import prisma from '../../prisma';
import logger from '../../services/logging.service';
import { JobHandler } from '../types/job-handler.type';
import { JobType } from '../types/job-type.enum';

export const BackfillCompetitionTimeEventsJobHandler: JobHandler = {
  async execute(_payload, context) {
    const competitions = await prisma.competition.findMany({
      where: {
        endsAt: { gt: new Date() },
        competitionTimeEvents: { none: {} }
      },
      select: { id: true },
      take: 100
    });

    if (competitions.length === 0) {
      return;
    }

    for (const competition of competitions) {
      await context.jobManager.add(JobType.RECALCULATE_COMPETITION_TIME_EVENTS, {
        competitionId: competition.id
      });
    }

    logger.info(`Backfilled competition time events for ${competitions.length} competitions`);
  }
};
