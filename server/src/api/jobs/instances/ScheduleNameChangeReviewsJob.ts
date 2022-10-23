import prisma from '../../../prisma';
import { Period, PeriodProps, NameChangeStatus } from '../../..//utils';
import { JobType, JobDefinition } from '../job.types';
import { jobManager } from '..';

class ScheduleNameChangeReviewsJob implements JobDefinition<unknown> {
  type: JobType;

  constructor() {
    this.type = JobType.SCHEDULE_NAME_CHANGE_REVIEWS;
  }

  async execute() {
    const pending = await prisma.nameChange.findMany({
      where: { status: NameChangeStatus.PENDING },
      orderBy: { createdAt: 'desc' },
      take: 500
    });

    // Distribute these evenly throughout the day, with a variable cooldown between each
    const cooldown = Math.floor(PeriodProps[Period.DAY].milliseconds / pending.length);

    pending.forEach((p, i) => {
      jobManager.add(
        { type: JobType.REVIEW_NAME_CHANGE, payload: { nameChangeId: p.id } },
        { delay: i * cooldown }
      );
    });
  }
}

export default new ScheduleNameChangeReviewsJob();
