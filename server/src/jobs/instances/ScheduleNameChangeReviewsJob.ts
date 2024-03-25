import { NameChangeStatus, Period, PeriodProps } from '../../utils';
import prisma from '../../prisma';
import { Job } from '../job.utils';
import jobManager from '../job.manager';
import { ReviewNameChangeJob } from './ReviewNameChangeJob';

class ScheduleNameChangeReviewsJob extends Job {
  async execute() {
    const pending = await prisma.nameChange.findMany({
      where: { status: NameChangeStatus.PENDING },
      orderBy: { createdAt: 'desc' },
      take: 500
    });

    // Distribute these evenly throughout the day, with a variable cooldown between each
    const cooldown = Math.floor(PeriodProps[Period.DAY].milliseconds / pending.length);

    for (let i = 0; i < pending.length; i++) {
      jobManager.add(new ReviewNameChangeJob(pending[i].id).setDelay(i * cooldown));
    }
  }
}

export { ScheduleNameChangeReviewsJob };
