import prisma, { PrismaTypes, Delta } from '../../../../prisma';
import { METRICS } from '../../../../utils';
import { prepareRecordValue } from '../record.utils';

async function syncPlayerRecords(delta: Delta) {
  const { playerId, period } = delta;

  const currentRecords = await prisma.record.findMany({
    where: { playerId, period }
  });

  const currentRecordMap = Object.fromEntries(currentRecords.map(r => [r.metric, r]));

  const toCreate: PrismaTypes.RecordCreateManyInput[] = [];
  const toUpdate: { recordId: number; newValue: number }[] = [];

  for (const metric of METRICS) {
    const value = delta[metric];

    if (value <= 0) {
      continue;
    }

    // No record exists for this period and metric, create a new one.
    if (!currentRecordMap[metric]) {
      toCreate.push({ playerId, period, metric, value: prepareRecordValue(metric, value) });
      continue;
    }

    // A record existed before, and should be updated with a new and greater value
    if (value > currentRecordMap[metric].value) {
      toUpdate.push({
        recordId: currentRecordMap[metric].id,
        newValue: prepareRecordValue(metric, value)
      });
    }
  }

  if (toCreate.length > 0) {
    await prisma.record.createMany({ data: toCreate, skipDuplicates: true });
  }

  for (const update of toUpdate) {
    await prisma.record.update({ where: { id: update.recordId }, data: { value: update.newValue } });
  }
}

export { syncPlayerRecords };
