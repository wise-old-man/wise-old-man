import prisma from '../../../prisma';
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

    allCompetitions.forEach(competition => {
      jobManager.add({
        type: JobType.UPDATE_COMPETITION_SCORE,
        payload: { competitionId: competition.id }
      });
    });
  }
}

export default new ScheduleCompetitionScoreUpdatesJob();
