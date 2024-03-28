import prisma from '../../prisma';
import { Period, PeriodProps } from '../../utils';
import { Job } from '../job.utils';

export class ScheduleGroupScoreUpdatesJob extends Job<unknown> {
  async execute() {
    const groups = await prisma.group.findMany({
      select: { id: true }
    });

    // Distribute these evenly throughout the day, with a variable cooldown between each
    const cooldown = Math.floor(PeriodProps[Period.DAY].milliseconds / groups.length);

    for (let i = 0; i < groups.length; i++) {
      const groupId = groups[i].id;
      this.jobManager.add('UpdateGroupScoreJob', { groupId }, { delay: i * cooldown });
    }
  }
}
