import { z } from 'zod';
import prisma, { Record, Period, PrismaTypes } from '../../../../prisma';
import { isVirtualMetric, Metric } from '../../../../utils/metrics';

const inputSchema = z.object({
  id: z.number().int().positive(),
  period: z.nativeEnum(Period),
  metricDeltas: z.array(
    z.object({
      metric: z.nativeEnum(Metric),
      value: z.number()
    })
  )
});

type RecordMap = {
  [metric in Metric]?: Record;
};

type SyncPlayerRecordsParams = z.infer<typeof inputSchema>;

async function syncPlayerRecords(payload: SyncPlayerRecordsParams): Promise<void> {
  const params = inputSchema.parse(payload);

  const currentRecords = await prisma.record.findMany({
    where: {
      playerId: params.id,
      period: params.period
    }
  });

  const currentRecordMap: RecordMap = Object.fromEntries(currentRecords.map(r => [r.metric, r]));

  const toCreate: PrismaTypes.RecordCreateManyInput[] = [];
  const toUpdate: { recordId: number; newValue: number }[] = [];

  params.metricDeltas.forEach(md => {
    if (md.value <= 0) return;

    // No record exists for this period and metric, create a new one.
    if (!currentRecordMap[md.metric]) {
      toCreate.push({
        playerId: params.id,
        period: params.period,
        metric: md.metric,
        value: prepareRecordValue(md.metric, md.value)
      });
      return;
    }

    // A record existed before, and should be updated with a new and greater value
    if (md.value > currentRecordMap[md.metric].value) {
      toUpdate.push({
        recordId: currentRecordMap[md.metric].id,
        newValue: prepareRecordValue(md.metric, md.value)
      });
    }
  });

  if (toCreate.length > 0) {
    await prisma.record.createMany({ data: toCreate, skipDuplicates: true });
  }

  if (toUpdate.length > 0) {
    await Promise.all(
      toUpdate.map(r => prisma.record.update({ where: { id: r.recordId }, data: { value: r.newValue } }))
    );
  }
}

// All records' values are stored as an Integer, but EHP/EHB records can have
// float values, so they're multiplied by 10,000 when saving to the database.
// Inversely, we need to divide any EHP/EHB records by 10,000 when fetching from the database.
function prepareRecordValue(metric: Metric, value: number) {
  return isVirtualMetric(metric) ? Math.floor(value * 10_000) : value;
}

export { syncPlayerRecords };
