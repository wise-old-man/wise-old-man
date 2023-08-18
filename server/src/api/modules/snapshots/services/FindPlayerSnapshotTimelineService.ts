import { z } from 'zod';
import prisma, { PrismaTypes, Snapshot } from '../../../../prisma';
import { Metric, getMetricValueKey, parsePeriodExpression } from '../../../../utils';
import { BadRequestError } from '../../../errors';

const inputSchema = z
  .object({
    id: z.number().int().positive(),
    metric: z.nativeEnum(Metric),
    // These can be filtered by a period string (week, day, 2m3w6d)
    period: z.string().optional(),
    // or by a time range (min date and max date)
    minDate: z.date().optional(),
    maxDate: z.date().optional(),
    limit: z.number().int().positive().optional().default(100_000)
  })
  .refine(s => !(s.minDate && s.maxDate && s.minDate >= s.maxDate), {
    message: 'Min date must be before the max date.'
  });

type FindPlayerSnapshotTimelineParams = z.infer<typeof inputSchema>;

async function findPlayerSnapshotTimeline(
  payload: FindPlayerSnapshotTimelineParams
): Promise<Array<{ value: number; date: Date }>> {
  const params = inputSchema.parse(payload);

  const filterQuery = buildFilterQuery(params);
  const metricValueKey = getMetricValueKey(params.metric);

  const snapshots = (await prisma.snapshot.findMany({
    select: {
      [metricValueKey]: true,
      createdAt: true
    },
    where: { playerId: params.id, ...filterQuery },
    orderBy: { createdAt: 'desc' },
    take: params.limit
  })) as unknown as Snapshot[];

  const history = snapshots.map(snapshot => {
    return {
      value: snapshot[metricValueKey],
      date: snapshot.createdAt
    };
  });

  return history;
}

function buildFilterQuery(params: FindPlayerSnapshotTimelineParams): PrismaTypes.SnapshotWhereInput {
  if (params.minDate && params.maxDate) {
    return {
      createdAt: {
        gte: params.minDate,
        lte: params.maxDate
      }
    };
  }

  if (params.period) {
    const parsedPeriod = parsePeriodExpression(params.period);

    if (!parsedPeriod) {
      throw new BadRequestError(`Invalid period: ${params.period}.`);
    }

    return {
      createdAt: {
        gte: new Date(Date.now() - parsedPeriod.durationMs),
        lte: new Date()
      }
    };
  }

  return {};
}

export { findPlayerSnapshotTimeline };
