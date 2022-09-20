import prisma from '../../../prisma';
import { Period, PeriodProps } from '../../..//utils';
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

    // Distribute these evenly throughout the day, with a variable cooldown between each
    const cooldown = Math.floor(PeriodProps[Period.DAY].milliseconds / allGroups.length);

    console.log(cooldown, allGroups);

    allGroups.forEach((group, i) => {
      jobManager.add(
        { type: JobType.UPDATE_GROUP_SCORE, payload: { groupId: group.id } },
        { delay: i * cooldown }
      );
    });
  }
}

export default new ScheduleGroupScoreUpdatesJob();
