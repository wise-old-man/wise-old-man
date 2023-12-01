import prisma, { TrendDatapoint } from '../../../prisma';
import { getMetricRankKey, getMetricValueKey, Metric, REAL_METRICS, SKILLS } from '../../../utils/metrics';
import { JobType, JobDefinition } from '../job.types';
import { normalizeDate } from '../../util/dates';

export interface CalculateSumsPayload {
  dateISO: string;
}

class CalculateSumsJob implements JobDefinition<unknown> {
  type: JobType;

  constructor() {
    this.type = JobType.CALCULATE_SUMS;
  }

  async execute(payload: CalculateSumsPayload) {
    const { dateISO } = payload;

    const date = normalizeDate(new Date(dateISO));
    const dayAgo = new Date(date.getTime() - 1000 * 60 * 60 * 24);

    const trendDatapoints = await prisma.trendDatapoint.findMany({
      where: { date }
    });

    // There's data missing, skip this
    if (trendDatapoints.length !== REAL_METRICS.length) return;

    const trendDatapointMap = new Map<Metric, TrendDatapoint>();
    trendDatapoints.forEach(t => trendDatapointMap.set(t.metric, t));

    // Create a materialized view with all the snapshots (max 1 per player) for the given date,
    // since we'll need to query this data many times, it's more efficient to store it in a view.
    // This also allows us to only select exactly the columns we need, to reduce memory usage on the API server.
    const materializedViewName = await setupMaterializedView(dayAgo, date);

    const sumMap = new Map<Metric, number>();

    for (const metric of REAL_METRICS) {
      if (metric === Metric.OVERALL) continue;

      const rankKey = getMetricRankKey(metric);
      const valueKey = getMetricValueKey(metric);

      const data = await prisma.$queryRawUnsafe<{ rank: number; value: number }[]>(
        `SELECT "${rankKey}" AS "rank", "${valueKey}" AS "value"
         FROM ${materializedViewName}
         WHERE "${rankKey}" > -1 AND "${valueKey}" > -1`
      );

      if (data.length === 0) continue;

      const sum = calculateSum(data, trendDatapointMap.get(metric));

      sumMap.set(metric, sum);
    }

    // Overall exp is a bit trickier to estimate as the exp doesn't necessarily
    // correlate to the rank (can have a lot of exp but lower level, so lower rank)
    // So instead of estimate it, we just sum all the other skills' estimates.
    let overallSum = 0;
    SKILLS.forEach(skill => {
      overallSum += sumMap.get(skill) ?? 0;
    });
    sumMap.set(Metric.OVERALL, overallSum);

    for (const metric of REAL_METRICS) {
      const sum = sumMap.get(metric);

      if (sum === undefined || sum < 0) continue;

      await prisma.trendDatapoint.update({
        where: { metric_date: { metric, date } },
        data: { sum }
      });
    }
  }
}

function calculateSum(data: { rank: number; value: number }[], datapoint: TrendDatapoint) {
  // Sort them by rank (asc), also remove -1 ranks and values
  const processedData = data
    .sort((a, b) => {
      return a.rank - b.rank;
    })
    .filter(d => {
      return d.rank > 0 && d.value > 0;
    });

  let maxVal = 0;
  const filteredData: typeof processedData = [];

  // Iterate through them, from highest rank to lowest (desc)
  [...processedData.reverse()].forEach(object => {
    if (object.value >= maxVal) {
      maxVal = object.value;
      filteredData.push(object);
    }
  });

  // Reverse them back to sorted by rank (asc)
  filteredData.reverse();

  if (filteredData.length === 0) {
    return 0;
  }

  // Artificially add the first and last ranked players, if needed
  const firstRanked = filteredData.at(0);
  const lastRanked = filteredData.at(-1);

  if (firstRanked.rank !== 1) {
    filteredData.unshift({ rank: 1, value: Math.max(datapoint.maxValue, firstRanked.value) });
  } else if (firstRanked.value < datapoint.maxValue) {
    filteredData[0].value = datapoint.maxValue;
  }

  if (lastRanked.rank < datapoint.maxRank) {
    filteredData.push({ rank: datapoint.maxRank, value: Math.min(datapoint.minValue, lastRanked.value) });
  } else if (lastRanked.value > datapoint.minValue) {
    filteredData[filteredData.length - 1].value = datapoint.minValue;
  }

  let areaSum = 0;

  // Calculate the total area
  for (let i = 0; i < filteredData.length - 1; i++) {
    const { rank: x1, value: y1 } = filteredData[i];
    const { rank: x2, value: y2 } = filteredData[i + 1];

    areaSum += y1 * (x2 - x1) - ((x2 - x1) * (y1 - y2)) / 2;
  }

  // Add the last item to the sum, as its area has not been iterated over
  areaSum += filteredData.at(-1).value;

  return Math.round(areaSum);
}

async function setupMaterializedView(startDate: Date, endDate: Date) {
  const materializedViewName = `all_day_snapshots_${endDate.getTime()}`;

  await prisma.$executeRawUnsafe(
    `CREATE MATERIALIZED VIEW IF NOT EXISTS ${materializedViewName} AS (
        WITH data AS (
            SELECT s.*, ROW_NUMBER() OVER (PARTITION BY p."id" ORDER BY s."createdAt" DESC) AS row_num
            FROM public.snapshots s
            JOIN public.players p ON p."id" = s."playerId"
            WHERE s."createdAt"::timestamp BETWEEN '${startDate.toISOString()}'::timestamp AND '${endDate.toISOString()}'::timestamp
        ) SELECT * FROM data WHERE row_num = 1
      )`
  );

  return materializedViewName;
}

export default new CalculateSumsJob();
