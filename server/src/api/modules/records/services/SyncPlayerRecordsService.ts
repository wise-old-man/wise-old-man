import { z } from 'zod';
import prisma, { Record, PrismaTypes, modifyRecords } from '../../../../prisma';
import { Period, Metric } from '../../../../utils';
import { prepareRecordValue } from '../record.utils';

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

  const currentRecords = await prisma.record
    .findMany({
      where: {
        playerId: params.id,
        period: params.period
      }
    })
    .then(modifyRecords);

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

export { syncPlayerRecords };
