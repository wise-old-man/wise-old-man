import prisma from '../../../prisma';
import { isDevelopment } from '../../../env';
import { REAL_METRICS } from '../../../utils/metrics';
import { normalizeDate, getDatesInBetween } from '../../util/dates';
import jobManager from '../job.manager';
import { JobType, JobDefinition } from '../job.types';

const DELAY_PER_DAY = 600_000; // ms

// The minimum date to gather data from
const MIN_DATE = normalizeDate(new Date('2022-12-01'));

class ScheduleTrendCalcsJob implements JobDefinition<unknown> {
  type: JobType;

  constructor() {
    this.type = JobType.SCHEDULE_TREND_CALCS;
  }

  async execute() {
    if (isDevelopment()) {
      return;
    }

    const datesToProcess = getDatesInBetween(MIN_DATE, normalizeDate(new Date()));

    const expectedCount = datesToProcess.length * REAL_METRICS.length;
    const totalDatapointsCount = await prisma.trendDatapoint.count();

    // Cleanup old materialized views (they might need to be recreated)
    await cleanupMaterializedViews();

    // All (base) rank limit data is up to date, can calculate sums
    if (expectedCount === totalDatapointsCount) {
      await scheduleSumCalcs();
      return;
    }

    // In order to accurately calculate sums, we need to have all rank limit data populated
    await scheduleRankLimitCalcs(datesToProcess);
  }
}

async function cleanupMaterializedViews() {
  const result = await prisma.$queryRaw<{ viewName: string }[]>`
    SELECT matviewname AS "viewName" FROM pg_matviews
    WHERE matviewname iLIKE 'all_day_snapshots_%'
  `;

  const activeViews = result.map(r => r.viewName);

  for (const view of activeViews) {
    await prisma.$executeRawUnsafe(`DROP MATERIALIZED VIEW IF EXISTS ${view}`);
  }
}

async function scheduleRankLimitCalcs(dates: Date[]) {
  const incompleteDates: Date[] = [];

  for (const date of dates) {
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
      { delay: index * DELAY_PER_DAY }
    );
  });
}

async function scheduleSumCalcs() {
  const result = await prisma.$queryRaw<{ date: Date }[]>`
      SELECT "date" FROM public."trendDatapoints"
      WHERE "sum" = -1 AND "maxRank" > -1 AND "maxValue" > -1 AND "minValue" > -1
      GROUP BY "date"
      ORDER BY "date" ASC
  `;

  const unpopulatedDates = result.map(d => d.date);

  unpopulatedDates.forEach((date, index) => {
    jobManager.add(
      { type: JobType.CALCULATE_SUMS, payload: { dateISO: date.toISOString() } },
      { delay: index * DELAY_PER_DAY }
    );
  });
}

export default new ScheduleTrendCalcsJob();
