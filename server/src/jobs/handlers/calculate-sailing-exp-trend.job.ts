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
  static getUniqueJobId(payload: Payload) {
    if (payload.segmentType === undefined || payload.segmentValue === undefined) {
      return 'global';
    }

    return [payload.segmentType, payload.segmentValue].join('_');
  }

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

    const data = await prisma.$queryRawUnsafe<Array<{ value: number; rank: number }>>(query);

    if (data.length === 0) {
      return;
    }

    logger.info(`Calculating Sailing EXP sum for ${data.length} players`, payload, true);

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

    const result = calculateSum(data, previousTrendDatapoint === null ? undefined : previousTrendDatapoint);

    logger.info(`Sailing EXP Trend result`, { payload, result }, true);

    if (result === null) {
      return;
    }

    const { sum, first, last, filteredCount } = result;

    logger.info('Filtered Sailing EXP data points', { filteredCount, payload }, true);

    if (filteredCount < 30) {
      return;
    }

    await prisma.trendDatapoint.create({
      data: {
        metric: Metric.SAILING,
        segmentType: payload.segmentType ?? null,
        segmentValue: payload.segmentValue ?? null,
        date: new Date(),
        sum,
        maxRank: last.rank,
        minValue: last.value,
        maxValue: first.value
      }
    });
  }
}

function calculateSum(
  data: Array<{
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
  const filteredData: typeof data = [];

  // Iterate through them, from highest rank to lowest (desc)
  [...data.reverse()].forEach(object => {
    if (object.value >= maxVal) {
      maxVal = object.value;
      filteredData.push(object);
    }
  });

  // Reverse them back to sorted by rank (asc)
  filteredData.reverse();

  if (filteredData.length === 0) {
    return null;
  }

  // Artificially add the first and last ranked players, if needed
  const firstRanked = filteredData[0];
  const lastRanked = filteredData[filteredData.length - 1];

  if (prevBounds) {
    if (firstRanked.rank !== 1) {
      filteredData.unshift({ rank: 1, value: Math.max(prevBounds.maxValue, firstRanked.value) });
    } else if (firstRanked.value < prevBounds.maxValue) {
      filteredData[0].value = prevBounds.maxValue;
    }

    if (lastRanked.rank < prevBounds.maxRank) {
      filteredData.push({ rank: prevBounds.maxRank, value: Math.min(prevBounds.minValue, lastRanked.value) });
    } else if (lastRanked.value > prevBounds.minValue) {
      filteredData[filteredData.length - 1].value = prevBounds.minValue;
    }
  }

  let areaSum = 0;

  // Calculate the total area
  for (let i = 0; i < filteredData.length - 1; i++) {
    const { rank: x1, value: y1 } = filteredData[i];
    const { rank: x2, value: y2 } = filteredData[i + 1];

    areaSum += y1 * (x2 - x1) - ((x2 - x1) * (y1 - y2)) / 2;
  }

  // Add the last item to the sum, as its area has not been iterated over
  areaSum += filteredData[filteredData.length - 1].value;

  return {
    filteredCount: filteredData.length,
    sum: Math.round(areaSum),
    first: filteredData[0],
    last: filteredData[filteredData.length - 1]
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
