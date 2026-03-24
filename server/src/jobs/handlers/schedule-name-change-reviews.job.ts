import prisma from '../../prisma';
import { NameChangeStatus, Period } from '../../types';
import { PeriodProps } from '../../utils/shared';
import { JobHandler } from '../types/job-handler.type';
import { JobType } from '../types/job-type.enum';

const REVIEWS_PER_DAY = 500;

export const ScheduleNameChangeReviewsJobHandler: JobHandler = {
  async execute(_payload, context) {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    const pending = await prisma.nameChange.findMany({
      where: { status: NameChangeStatus.PENDING },
      orderBy: { createdAt: 'desc' },
      take: REVIEWS_PER_DAY
    });

    // Distribute these evenly throughout the day, with a variable cooldown between each
    const cooldown = Math.floor(PeriodProps[Period.DAY].milliseconds / pending.length);

    for (let i = 0; i < pending.length; i++) {
      const nameChangeId = pending[i].id;
      context.jobManager.add(JobType.REVIEW_NAME_CHANGE, { nameChangeId }, { delay: i * cooldown });
    }
  }
};
