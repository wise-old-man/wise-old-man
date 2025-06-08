import { prepareRecordValue } from '../../api/modules/records/record.utils';
import { POST_RELEASE_HISCORE_ADDITIONS } from '../../api/modules/snapshots/snapshot.utils';
import prisma, { PrismaTypes } from '../../prisma';
import { getMetricValueKey, Metric, METRICS, Period } from '../../utils';
import { Job } from '../job.class';
import { JobOptions } from '../types/job-options.type';

interface Payload {
  username: string;
  period: Period;
  periodStartDate: Date;
}

export class SyncPlayerRecordsJob extends Job<Payload> {
  static options: JobOptions = {
    maxConcurrent: 20
  };

  async execute({ username, period, periodStartDate }: Payload) {
    const currentDelta = await prisma.delta.findFirst({
      where: {
        player: {
          username
        },
        period
      }
    });

    if (currentDelta === null) {
      return;
    }

    const playerId = currentDelta.playerId;

    const [currentRecords, previousSnapshot] = await Promise.all([
      prisma.record.findMany({
        where: {
          playerId,
          period
        }
      }),
      prisma.snapshot.findFirst({
        where: {
          playerId,
          createdAt: periodStartDate
        }
      })
    ]);

    if (previousSnapshot === null) {
      return;
    }

    const currentRecordMap = Object.fromEntries(currentRecords.map(r => [r.metric, r]));

    const toCreate: PrismaTypes.RecordCreateManyInput[] = [];
    const toUpdate: { metric: Metric; newValue: number }[] = [];

    for (const metric of METRICS) {
      const value = currentDelta[metric];

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
        toCreate.push({
          playerId,
          period,
          metric,
          value: prepareRecordValue(metric, value)
        });
        continue;
      }

      // A record existed before, and should be updated with a new and greater value
      if (value > currentRecordMap[metric].value) {
        toUpdate.push({
          metric,
          newValue: prepareRecordValue(metric, value)
        });
      }
    }

    if (toCreate.length === 0 && toUpdate.length === 0) {
      return;
    }

    await prisma.$transaction(async tx => {
      if (toCreate.length > 0) {
        await tx.record.createMany({
          data: toCreate,
          skipDuplicates: true
        });
      }

      for (const update of toUpdate) {
        await tx.record.update({
          where: {
            playerId_period_metric: {
              playerId,
              period,
              metric: update.metric
            }
          },
          data: { value: update.newValue }
        });
      }
    });
  }
}
