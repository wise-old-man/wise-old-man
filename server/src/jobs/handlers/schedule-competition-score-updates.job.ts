import prisma from '../../prisma';
import { Period } from '../../types';
import { PeriodProps } from '../../utils/shared';
import { Job } from '../job.class';
import { JobType } from '../types/job-type.enum';

export class ScheduleCompetitionScoreUpdatesJob extends Job<unknown> {
  async execute() {
    const competitions = await prisma.competition.findMany({
      where: {
        OR: [{ endsAt: { gt: new Date() } }, { score: { gt: 0 } }]
      },
      select: { id: true }
    });

    // Distribute these evenly throughout the 24h, with a variable cooldown between each
    const cooldown = Math.floor(PeriodProps[Period.DAY].milliseconds / competitions.length);

    for (let i = 0; i < competitions.length; i++) {
      const competitionId = competitions[i].id;
      this.jobManager.add(JobType.UPDATE_COMPETITION_SCORE, { competitionId }, { delay: i * cooldown });
    }
  }
}
