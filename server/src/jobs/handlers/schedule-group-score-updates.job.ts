import prisma from '../../prisma';
import { Period } from '../../types';
import { PeriodProps } from '../../utils/shared';
import { Job } from '../job.class';
import { JobType } from '../types/job-type.enum';

export class ScheduleGroupScoreUpdatesJob extends Job<unknown> {
  async execute() {
    const groups = await prisma.group.findMany({
      select: { id: true }
    });

    // Distribute these evenly throughout the day, with a variable cooldown between each
    const cooldown = Math.floor(PeriodProps[Period.DAY].milliseconds / groups.length);

    for (let i = 0; i < groups.length; i++) {
      const groupId = groups[i].id;
      this.jobManager.add(JobType.UPDATE_GROUP_SCORE, { groupId }, { delay: i * cooldown });
    }
  }
}
