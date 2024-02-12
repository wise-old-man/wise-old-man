import { z } from 'zod';
import prisma, { Snapshot, PrismaTypes } from '../../../../prisma';
import { parsePeriodExpression } from '../../../../utils';
import { BadRequestError } from '../../../errors';

const inputSchema = z
  .object({
    id: z.number().int().positive(),
    // These can be filtered by a period string (week, day, 2m3w6d)
    period: z.string().optional(),
    // or by a time range (min date and max date)
    minDate: z.date().optional(),
    maxDate: z.date().optional(),
    limit: z.number().int().positive().optional().default(100_000),
    offset: z.optional(z.number().int().nonnegative("Parameter 'offset' must be >= 0.")).default(0)
  })
  .refine(s => !(s.minDate && s.maxDate && s.minDate >= s.maxDate), {
    message: 'Min date must be before the max date.'
  });

type FindPlayerSnapshotsParams = z.infer<typeof inputSchema>;

async function findPlayerSnapshots(payload: FindPlayerSnapshotsParams): Promise<Snapshot[]> {
  const params = inputSchema.parse(payload);

  const filterQuery = buildFilterQuery(params);

  const snapshots = await prisma.snapshot.findMany({
    where: { playerId: params.id, ...filterQuery },
    orderBy: { createdAt: 'desc' },
    take: params.limit,
    skip: params.offset
  });

  return snapshots;
}

function buildFilterQuery(params: FindPlayerSnapshotsParams): PrismaTypes.SnapshotWhereInput {
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

export { findPlayerSnapshots };
