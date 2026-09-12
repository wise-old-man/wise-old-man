import { createId } from '@paralleldrive/cuid2';
import ms from 'ms';
import prisma from '../../prisma';
import { JobHandler } from '../types/job-handler.type';
import { JobType } from '../types/job-type.enum';

export const ScheduleCompetitionScoreUpdatesJobHandler: JobHandler = {
  async execute(_payload, context) {
    const competitions = await prisma.competition.findMany({
      where: {
        OR: [{ endsAt: { gt: new Date() } }, { score: { gt: 0 } }]
      },
      select: { id: true }
    });

    // Distribute these evenly throughout the 24h, with a variable cooldown between each
    const cooldown = Math.floor(ms('1 day') / competitions.length);

    for (let i = 0; i < competitions.length; i++) {
      const competitionId = competitions[i].id;

      context.jobManager.add(
        JobType.UPDATE_COMPETITION_SCORE,
        { competitionId },
        {
          delay: i * cooldown,
          jobId: createId() // unique to avoid deduping
        }
      );
    }
  }
};
