import { z } from 'zod';
import { Metric } from '../../../../utils/metrics';
import prisma, { Record, Period, PrismaTypes, modifyRecords } from '../../../../prisma';

const inputSchema = z.object({
  id: z.number().int().positive(),
  period: z.nativeEnum(Period).optional(),
  metric: z.nativeEnum(Metric).optional()
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
