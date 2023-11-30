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

        if (rank === -1 || value === -1) return;

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
    });

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
  }
}

export default new RecalculateRankLimitsJob();
