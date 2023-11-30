import prisma from '../../../prisma';
import { Metric, REAL_METRICS, Snapshot, getMetricRankKey, getMetricValueKey } from '../../../utils';
import { JobType, JobDefinition } from '../job.types';

export interface RecalculateRankLimitsPayload {
  dateISO: string;
}

/**
 * This recalculates the rank limits for a given date.
 *
 * In order to accurately calculate the exp sum for any given metric on any given date,
 * we should have the first and last ranked player's value and rank.
 *
 * To achieve this, we need to query our own data to find the limits for each metric for each day.
 */
class RecalculateRankLimitsJob implements JobDefinition<unknown> {
  type: JobType;

  constructor() {
    this.type = JobType.RECALCULATE_RANK_LIMITS;
  }

  async execute(payload: RecalculateRankLimitsPayload) {
    const { dateISO } = payload;

    const date = new Date(dateISO);

    const maximumRankMap = new Map<Metric, number>();
    const minimumValueMap = new Map<Metric, number>();
    const maximumValueMap = new Map<Metric, number>();

    const dayAgo = new Date(date.getTime() - 1000 * 60 * 60 * 24);

    const previousDayDatapoints = await prisma.trendDatapoint.findMany({
      where: { date: dayAgo }
    });

    // Pre-populate the maps with the previous day's limits
    previousDayDatapoints.forEach(datapoint => {
      maximumRankMap.set(datapoint.metric, datapoint.maxRank);
      minimumValueMap.set(datapoint.metric, datapoint.minValue);
      maximumValueMap.set(datapoint.metric, datapoint.maxValue);
    });

    // Fetch one snapshots from each player for the given date
    const allSnapshots = await prisma.$queryRaw<Snapshot[]>`
      WITH data AS (
          SELECT
              s.*,
              ROW_NUMBER() OVER (PARTITION BY p."id" ORDER BY s."createdAt" DESC) AS row_num
          FROM
              public.snapshots s
          JOIN
              public.players p ON p."id" = s."playerId"
          WHERE
              s."createdAt" BETWEEN ${dayAgo} AND ${date}
      )
      SELECT * FROM data WHERE row_num = 1;
  `;

    // Update the maps with today's limits
    allSnapshots.forEach(snapshot => {
      REAL_METRICS.forEach(metric => {
        const rank = snapshot[getMetricRankKey(metric)];
        const value = snapshot[getMetricValueKey(metric)];

        if ((!maximumRankMap.has(metric) || maximumRankMap.get(metric) < rank) && rank > -1) {
          maximumRankMap.set(metric, rank);
        }

        if ((!minimumValueMap.has(metric) || minimumValueMap.get(metric) > value) && value > -1) {
          minimumValueMap.set(metric, value);
        }

        if ((!maximumValueMap.has(metric) || maximumValueMap.get(metric) < value) && value > -1) {
          maximumValueMap.set(metric, value);
        }
      });
    });

    await prisma.$transaction(async tx => {
      // Delete all datapoints for the given date
      await tx.trendDatapoint.deleteMany({
        where: { date }
      });

      // Re-create the datapoints for the given date
      await tx.trendDatapoint.createMany({
        data: REAL_METRICS.map(metric => {
          return {
            metric,
            date,
            sum: -1,
            maxValue: maximumValueMap.get(metric) ?? 0,
            minValue: Math.min(minimumValueMap.get(metric) ?? 0, 2147483647), // Ensure this doesn't go over the max int value (it shouldn't in production)
            maxRank: maximumRankMap.get(metric) ?? 0
          };
        })
      });
    });
  }
}

export default new RecalculateRankLimitsJob();
