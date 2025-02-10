import prisma, { PrismaTypes, Delta } from '../../../../prisma';
import { getMetricValueKey, METRICS, Snapshot } from '../../../../utils';
import { POST_RELEASE_HISCORE_ADDITIONS } from '../../snapshots/snapshot.utils';
import { prepareRecordValue } from '../record.utils';

async function syncPlayerRecords(delta: Delta, previousSnapshot: Snapshot) {
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

    // Some metrics (such as collection logs, and some wildy bosses) were added to the hiscores after their in-game release.
    // Which meant a lot of players jumped from unranked (-1) to their current kc at the time, this generated a lot of records.
    // which can likely never be beaten. To avoid this, we skip adding records for these metrics if the previous snapshot value was -1.
    if (
      POST_RELEASE_HISCORE_ADDITIONS.includes(metric) &&
      previousSnapshot[getMetricValueKey(metric)] === -1
    ) {
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
