import { Period, PeriodProps } from '../../utils';
import prisma from '../../prisma';
import { Job } from '../job.utils';
import jobManager from '../job.manager';
import { UpdateGroupScoreJob } from './UpdateGroupScoreJob';

class ScheduleGroupScoreUpdatesJob extends Job {
  async execute() {
    const groups = await prisma.group.findMany({
      select: { id: true }
    });

    // Distribute these evenly throughout the day, with a variable cooldown between each
    const cooldown = Math.floor(PeriodProps[Period.DAY].milliseconds / groups.length);

    for (let i = 0; i < groups.length; i++) {
      await jobManager.add(new UpdateGroupScoreJob(groups[i].id).setDelay(i * cooldown));
    }
  }
}

export { ScheduleGroupScoreUpdatesJob };
