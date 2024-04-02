import prisma from '../../prisma';
import { Period, PeriodProps } from '../../utils';
import { Job } from '../job.utils';

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
      this.jobManager.add('UpdateCompetitionScoreJob', { competitionId }, { delay: i * cooldown });
    }
  }
}
