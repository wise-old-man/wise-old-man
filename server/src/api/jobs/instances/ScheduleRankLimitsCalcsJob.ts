import { isDevelopment } from '../../../env';
import prisma from '../../../prisma';
import { REAL_METRICS } from '../../../utils/metrics';
import { normalizeDate, getDatesInBetween } from '../../util/dates';
import { JobType, JobDefinition } from '../job.types';
import jobManager from '../job.manager';

// The minimum date to gather data from
const MIN_DATE = normalizeDate(new Date('2023-11-16'));

/**
 * This job checks if there is any missing limit data for trend datapoints.
 *
 * In order to accurately calculate the exp sum for any given metric on any given date,
 * we should have the first and last ranked player's value and rank.
 *
 * To achieve this, we need to query our own data to find the limits for each metric for each day.
 */
class ScheduleRankLimitsCalcsJob implements JobDefinition<unknown> {
  type: JobType;

  constructor() {
    this.type = JobType.SCHEDULE_RANK_LIMIT_CALCS;
  }

  async execute() {
    if (isDevelopment()) {
      return;
    }

    const yesterday = normalizeDate(new Date(Date.now() - 1000 * 60 * 60 * 24));
    const datesInBetween = getDatesInBetween(MIN_DATE, yesterday);

    const expectedCount = datesInBetween.length * REAL_METRICS.length;
    const totalDatapointsCount = await prisma.trendDatapoint.count();

    // All up to date, no incomplete dates
    if (expectedCount === totalDatapointsCount) {
      return;
    }

    const incompleteDates: Date[] = [];

    for (const date of datesInBetween) {
      const dailyCount = await prisma.trendDatapoint.count({
        where: { date }
      });

      if (dailyCount < REAL_METRICS.length) {
        incompleteDates.push(date);
      }
    }

    incompleteDates.forEach((date, index) => {
      jobManager.add(
        { type: JobType.CALCULATE_RANK_LIMITS, payload: { dateISO: date.toISOString() } },
        { delay: index * (1000 * 60) } // Delay each recalc by 60 seconds
      );
    });
  }
}

export default new ScheduleRankLimitsCalcsJob();
