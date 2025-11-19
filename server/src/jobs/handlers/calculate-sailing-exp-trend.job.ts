import prisma from '../../prisma';
import logger from '../../services/logging.service';
import { Metric } from '../../types';
import { Job } from '../job.class';

// const SAILING_RELEASE_DATE = new Date('2025-11-19T09:00:00Z');
// Math.max(SAILING_RELEASE_DATE.getTime(), Date.now() - 1000 * 60 * 60 * 24)

interface Payload {
  segmentType?: 'country' | 'player-type' | 'player-build';
  segmentValue?: string;
}

export class CalculateSailingExpTrendJob extends Job<Payload> {
  async execute(payload: Payload) {
    const updateCuttofDate = new Date(Date.now() - 1000 * 60 * 60 * 24);

    const query = ` 
        SELECT "sailing" AS "value", "sailingRank" AS "rank"
        FROM public.players
        WHERE "updatedAt" > '${updateCuttofDate.toISOString()}'::timestamp
        AND "sailing" > -1
        AND "sailingRank" > -1
        ${getSegmentFilter(payload.segmentType, payload.segmentValue)}
        ORDER BY "rank" ASC
    `;

    const rawData = await prisma.$queryRawUnsafe<Array<{ value: number; rank: number }>>(query);

    if (rawData.length === 0) {
      return;
    }

    logger.info(`Calculating Sailing EXP sum for ${rawData.length} players`, payload, true);

    const previousTrendDatapoint = await prisma.trendDatapoint.findFirst({
      where: {
        metric: Metric.SAILING,
        segmentType: payload.segmentType ?? null,
        segmentValue: payload.segmentValue ?? null
      },
      orderBy: {
        date: 'desc'
      }
    });

    logger.info(`Previous Sailing Trend datapoint`, { payload, previousTrendDatapoint }, true);

    if (rawData.length < 30) {
      return;
    }

    const result =
      payload.segmentType === undefined
        ? calculateGlobalSum(rawData, previousTrendDatapoint ?? undefined)
        : calculateSegmentSum(rawData);

    const { sum, first, last, size } = result;
    logger.info(`Sailing EXP Trend result`, { payload, result }, true);

    if (size < 30 || (previousTrendDatapoint !== null && sum <= previousTrendDatapoint.sum)) {
      return;
    }

    await prisma.trendDatapoint.create({
      data: {
        metric: Metric.SAILING,
        segmentType: payload.segmentType ?? null,
        segmentValue: payload.segmentValue ?? null,
        segmentSize: size,
        date: new Date(),
        sum,
        maxRank: last.rank,
        minValue: last.value,
        maxValue: first.value
      }
    });
  }
}

function calculateSegmentSum(
  data: Array<{
    rank: number;
    value: number;
  }>
) {
  return {
    size: data.length,
    first: data[0],
    last: data[data.length - 1],
    sum: data.reduce((acc, curr) => (acc += curr.value), 0)
  };
}

function calculateGlobalSum(
  rawData: Array<{
    rank: number;
    value: number;
  }>,
  prevBounds?: {
    maxRank: number;
    maxValue: number;
    minValue: number;
  }
) {
  let maxVal = 0;
  const data: typeof rawData = [];

  // Iterate through them, from highest rank to lowest (desc)
  [...rawData.reverse()].forEach(object => {
    if (object.value >= maxVal) {
      maxVal = object.value;
      data.push(object);
    }
  });

  // Reverse them back to sorted by rank (asc)
  data.reverse();

  // Artificially add the first and last ranked players, if needed
  const firstRanked = data[0];
  const lastRanked = data[data.length - 1];

  if (prevBounds) {
    if (firstRanked.rank !== 1) {
      data.unshift({ rank: 1, value: Math.max(prevBounds.maxValue, firstRanked.value) });
    } else if (firstRanked.value < prevBounds.maxValue) {
      data[0].value = prevBounds.maxValue;
    }

    if (lastRanked.rank < prevBounds.maxRank) {
      data.push({ rank: prevBounds.maxRank, value: Math.min(prevBounds.minValue, lastRanked.value) });
    } else if (lastRanked.value > prevBounds.minValue) {
      data[data.length - 1].value = prevBounds.minValue;
    }
  }

  let areaSum = 0;

  // Calculate the total area
  for (let i = 0; i < data.length - 1; i++) {
    const { rank: x1, value: y1 } = data[i];
    const { rank: x2, value: y2 } = data[i + 1];

    areaSum += y1 * (x2 - x1) - ((x2 - x1) * (y1 - y2)) / 2;
  }

  // Add the last item to the sum, as its area has not been iterated over
  areaSum += data[data.length - 1].value;

  return {
    sum: Math.round(areaSum),
    size: data.length,
    first: data[0],
    last: data[data.length - 1]
  };
}

function getSegmentFilter(
  segmentType: 'country' | 'player-type' | 'player-build' | undefined,
  segmentValue: string | undefined
) {
  switch (segmentType) {
    case 'country':
      return `AND "country" = '${segmentValue}'`;
    case 'player-type':
      return `AND "type" = '${segmentValue}'`;
    case 'player-build':
      return `AND "build" = '${segmentValue}'`;
    default:
      return 'AND 1=1';
  }
}
