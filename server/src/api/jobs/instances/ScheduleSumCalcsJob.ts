import { isDevelopment } from '../../../env';
import prisma from '../../../prisma';
import jobManager from '../job.manager';
import { JobType, JobDefinition } from '../job.types';

class ScheduleSumCalcsJob implements JobDefinition<unknown> {
  type: JobType;

  constructor() {
    this.type = JobType.SCHEDULE_SUM_CALCS;
  }

  async execute() {
    if (isDevelopment()) {
      return;
    }

    const unpopulatedDates = (
      await prisma.$queryRaw<{ date: Date }[]>`
        SELECT "date" FROM public."trendDatapoints"
        WHERE "sum" = -1 AND "maxRank" > -1 AND "maxValue" > -1 AND "minValue" > -1
        GROUP BY "date"
        ORDER BY "date" ASC
    `
    ).map(d => d.date);

    unpopulatedDates.forEach((date, index) => {
      jobManager.add(
        { type: JobType.CALCULATE_SUMS, payload: { dateISO: date.toISOString() } },
        { delay: index * (1000 * 60) } // Delay each recalc by 60 seconds
      );
    });
  }
}

export default new ScheduleSumCalcsJob();
