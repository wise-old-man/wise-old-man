import prisma from '../../prisma';
import { NameChangeStatus, Period, PeriodProps } from '../../utils';
import { Job } from '../job.utils';

export class ScheduleNameChangeReviewsJob extends Job<unknown> {
  async execute() {
    const pending = await prisma.nameChange.findMany({
      where: { status: NameChangeStatus.PENDING },
      orderBy: { createdAt: 'desc' },
      take: 500
    });

    // Distribute these evenly throughout the day, with a variable cooldown between each
    const cooldown = Math.floor(PeriodProps[Period.DAY].milliseconds / pending.length);

    for (let i = 0; i < pending.length; i++) {
      const nameChangeId = pending[i].id;
      this.jobManager.add('ReviewNameChangeJob', { nameChangeId }, { delay: i * cooldown });
    }
  }
}
