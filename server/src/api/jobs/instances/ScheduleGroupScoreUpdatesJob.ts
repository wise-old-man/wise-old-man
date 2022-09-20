import prisma from '../../../prisma';
import { JobType, JobDefinition } from '../job.types';
import { jobManager } from '..';

class ScheduleGroupScoreUpdatesJob implements JobDefinition<{}> {
  type: JobType;

  constructor() {
    this.type = JobType.SCHEDULE_GROUP_SCORE_UPDATES;
  }

  async execute() {
    const allGroups = await prisma.group.findMany({
      select: { id: true }
    });

    allGroups.forEach(group => {
      jobManager.add({
        type: JobType.UPDATE_GROUP_SCORE,
        payload: { groupId: group.id }
      });
    });
  }
}

export default new ScheduleGroupScoreUpdatesJob();
