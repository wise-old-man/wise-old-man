import prisma, { Record, PrismaTypes } from '../../../../prisma';
import { Period, Metric } from '../../../../utils';
import { prepareRecordValue } from '../record.utils';

type RecordMap = {
  [metric in Metric]?: Record;
};

async function syncPlayerRecords(
  playerId: number,
  period: Period,
  metricDeltas: Array<{ metric: Metric; value: number }>
): Promise<void> {
  const currentRecords = await prisma.record.findMany({
    where: { playerId, period }
  });

  const currentRecordMap: RecordMap = Object.fromEntries(currentRecords.map(r => [r.metric, r]));

  const toCreate: PrismaTypes.RecordCreateManyInput[] = [];
  const toUpdate: { recordId: number; newValue: number }[] = [];

  metricDeltas.forEach(md => {
    if (md.value <= 0) return;

    // No record exists for this period and metric, create a new one.
    if (!currentRecordMap[md.metric]) {
      toCreate.push({
        playerId,
        period,
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

  for (const update of toUpdate) {
    await prisma.record.update({ where: { id: update.recordId }, data: { value: update.newValue } });
  }
}

export { syncPlayerRecords };
