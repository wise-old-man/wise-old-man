import { z } from 'zod';
import prisma, { Record, PeriodEnum, MetricEnum, PrismaTypes, modifyRecords } from '../../../../prisma';

const inputSchema = z.object({
  id: z.number().int().positive(),
  period: z.nativeEnum(PeriodEnum).optional(),
  metric: z.nativeEnum(MetricEnum).optional()
});

type FindPlayerRecordParams = z.infer<typeof inputSchema>;

async function findPlayerRecords(payload: FindPlayerRecordParams): Promise<Record[]> {
  const params = inputSchema.parse(payload);

  const query: PrismaTypes.RecordWhereInput = {
    playerId: params.id
  };

  if (params.period) query.period = params.period;
  if (params.metric) query.metric = params.metric;

  const records = await prisma.record
    .findMany({
      where: { ...query },
      orderBy: { updatedAt: 'desc' }
    })
    .then(modifyRecords);

  return records;
}

export { findPlayerRecords };
