import prisma from '../../../prisma';
import { Metric, REAL_METRICS, getMetricRankKey, getMetricValueKey } from '../../../utils';
import { normalizeDate } from '../../util/dates';
import jobManager from '../job.manager';
import { JobType, JobDefinition } from '../job.types';

export interface CalculateRankLimitsPayload {
  dateISO: string;
}

/**
 * This calculates the rank limits for a given date.
 *
 * In order to accurately calculate the exp sum for any given metric on any given date,
 * we should have the first and last ranked player's value and rank.
 *
 * To achieve this, we need to query our own data to find the limits for each metric for each day.
 */
class CalculateRankLimitsJob implements JobDefinition<CalculateRankLimitsPayload> {
  type: JobType;

  constructor() {
    this.type = JobType.CALCULATE_RANK_LIMITS;
  }

  async execute(payload: CalculateRankLimitsPayload) {
    const { dateISO } = payload;

    const date = normalizeDate(new Date(dateISO));

    const maximumRankMap = new Map<Metric, number>();
    const minimumValueMap = new Map<Metric, number>();
    const maximumValueMap = new Map<Metric, number>();

    const dayAgo = new Date(date.getTime() - 1000 * 60 * 60 * 24);

    const previousDayDatapoints = await prisma.trendDatapoint.findMany({
      where: { date: dayAgo }
    });

    // Pre-populate the maps with the previous day's limits
    previousDayDatapoints.forEach(datapoint => {
      if (datapoint.maxRank > -1) {
        maximumRankMap.set(datapoint.metric, datapoint.maxRank);
      }

      if (datapoint.minValue > -1) {
        minimumValueMap.set(datapoint.metric, datapoint.minValue);
      }

      if (datapoint.maxValue > -1) {
        maximumValueMap.set(datapoint.metric, datapoint.maxValue);
      }
    });

    // Create a materialized view with all the snapshots (max 1 per player) for the given date,
    // since we'll need to query this data many times, it's more efficient to store it in a view.
    // This also allows us to only select exactly the columns we need, to reduce memory usage on the API server.
    const materializedViewName = await setupMaterializedView(dayAgo, date);

    for (const metric of REAL_METRICS) {
      const rankKey = getMetricRankKey(metric);
      const valueKey = getMetricValueKey(metric);

      const data = await prisma.$queryRawUnsafe<{ rank: number; value: number }[]>(
        `SELECT "${rankKey}" AS "rank", "${valueKey}" AS "value"
         FROM ${materializedViewName}
         WHERE "${rankKey}" > -1 AND "${valueKey}" > -1`
      );

      data.forEach(({ rank, value }) => {
        const maxRank = maximumRankMap.get(metric);
        const minValue = minimumValueMap.get(metric);
        const maxValue = maximumValueMap.get(metric);

        if (maxRank === undefined || maxRank < rank) {
          maximumRankMap.set(metric, rank);
        }

        if (maxValue === undefined || maxValue < value) {
          maximumValueMap.set(metric, value);
        }

        if (minValue === undefined || minValue > value) {
          minimumValueMap.set(metric, value > 2147483647 ? 2147483647 : Number(value));
        }
      });
    }

    await prisma.$transaction(async tx => {
      // Delete all datapoints for the given date
      await tx.trendDatapoint.deleteMany({
        where: { date }
      });

      // Re-create the datapoints for the given date
      await tx.trendDatapoint.createMany({
        data: REAL_METRICS.map(metric => {
          const maxRank = maximumRankMap.get(metric) ?? -1;
          const maxValue = maximumValueMap.get(metric) ?? -1;
          const minValue = minimumValueMap.get(metric) ?? -1;

          return { metric, date, sum: -1, maxValue, minValue, maxRank };
        })
      });
    });

    jobManager.add({
      type: JobType.CALCULATE_SUMS,
      payload: { dateISO: date.toISOString() }
    });
  }
}

async function setupMaterializedView(startDate: Date, endDate: Date) {
  const materializedViewName = `all_day_snapshots_${endDate.getTime()}`;

  await prisma.$executeRawUnsafe(`DROP MATERIALIZED VIEW IF EXISTS ${materializedViewName}`);

  await prisma.$executeRawUnsafe(
    `CREATE MATERIALIZED VIEW ${materializedViewName} AS (
        WITH data AS (
            SELECT s.*, ROW_NUMBER() OVER (PARTITION BY p."id" ORDER BY s."createdAt" DESC) AS row_num
            FROM public.snapshots s
            JOIN public.players p ON p."id" = s."playerId"
            WHERE p."type" = 'regular' AND s."createdAt"::timestamp BETWEEN '${startDate.toISOString()}'::timestamp AND '${endDate.toISOString()}'::timestamp
        ) SELECT * FROM data WHERE row_num = 1
      )`
  );

  return materializedViewName;
}

export default new CalculateRankLimitsJob();
