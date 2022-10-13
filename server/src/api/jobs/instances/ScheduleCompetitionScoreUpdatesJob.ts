import prisma from '../../../prisma';
import { Period, PeriodProps } from '../../..//utils';
import { JobType, JobDefinition } from '../job.types';
import { jobManager } from '..';

class ScheduleCompetitionScoreUpdatesJob implements JobDefinition<{}> {
  type: JobType;

  constructor() {
    this.type = JobType.SCHEDULE_COMPETITION_SCORE_UPDATES;
  }

  async execute() {
    const allCompetitions = await prisma.competition.findMany({
      where: {
        OR: [{ endsAt: { gt: new Date() } }, { score: { gt: 0 } }]
      },
      select: { id: true }
    });

    // Distribute these evenly throughout the 12h, with a variable cooldown between each
    const cooldown = Math.floor(PeriodProps[Period.DAY].milliseconds / 2 / allCompetitions.length);

    allCompetitions.forEach((competition, i) => {
      jobManager.add(
        { type: JobType.UPDATE_COMPETITION_SCORE, payload: { competitionId: competition.id } },
        { delay: i * cooldown }
      );
    });
  }
}

export default new ScheduleCompetitionScoreUpdatesJob();
