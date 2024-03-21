import { Period, PeriodProps } from '../../utils';
import prisma from '../../prisma';
import { Job } from '../job.utils';
import jobManager from '../job.manager';
import { UpdateCompetitionScoreJob } from './UpdateCompetitionScoreJob';

class ScheduleCompetitionScoreUpdatesJob extends Job {
  async execute() {
    const competitions = await prisma.competition.findMany({
      where: {
        OR: [{ endsAt: { gt: new Date() } }, { score: { gt: 0 } }]
      },
      select: { id: true }
    });

    // Distribute these evenly throughout the 12h, with a variable cooldown between each
    const cooldown = Math.floor(PeriodProps[Period.DAY].milliseconds / 2 / competitions.length);

    for (let i = 0; i < competitions.length; i++) {
      await jobManager.add(new UpdateCompetitionScoreJob(competitions[i].id).setDelay(i * cooldown));
    }
  }
}

export { ScheduleCompetitionScoreUpdatesJob };
