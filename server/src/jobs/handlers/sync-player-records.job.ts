import { POST_RELEASE_HISCORE_ADDITIONS } from '../../api/modules/snapshots/snapshot.utils';
import prisma, { PrismaTypes } from '../../prisma';
import { Metric, METRICS, Period } from '../../types';
import { getMetricValueKey } from '../../utils/get-metric-value-key.util';
import { prepareDecimalValue } from '../../utils/prepare-decimal-value.util';
import { Job } from '../job.class';
import { JobOptions } from '../types/job-options.type';

interface Payload {
  username: string;
  period: Period;
  periodStartDate: Date;
}

export class SyncPlayerRecordsJob extends Job<Payload> {
  static options: JobOptions = {
    maxConcurrent: 8
  };

  static getUniqueJobId(payload: Payload) {
    return [payload.username, payload.period, payload.periodStartDate.getTime()].join('_');
  }

  async execute({ username, period, periodStartDate }: Payload) {
    const currentDeltas = await prisma.cachedDelta.findMany({
      where: {
        player: {
          username
        },
        period
      }
    });

    if (currentDeltas.length === 0) {
      return;
    }

    const playerId = currentDeltas[0].playerId;

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

    const currentDeltasMap = new Map(currentDeltas.map(d => [d.metric, d]));
    const currentRecordsMap = new Map(currentRecords.map(r => [r.metric, r]));

    const toCreate: PrismaTypes.RecordCreateManyInput[] = [];
    const toUpdate: { metric: Metric; newValue: number }[] = [];

    for (const metric of METRICS) {
      const metricDelta = currentDeltasMap.get(metric);

      if (metricDelta === undefined || metricDelta.value <= 0) {
        continue;
      }

      const value = metricDelta.value;

      // Some metrics (such as collection logs, and some wildy bosses) were added to the hiscores after their in-game release.
      // Which meant a lot of players jumped from unranked (-1) to their current kc at the time, this generated a lot of records.
      // which can likely never be beaten. To avoid this, we skip adding records for these metrics if the previous snapshot value was -1.
      if (
        POST_RELEASE_HISCORE_ADDITIONS.includes(metric) &&
        previousSnapshot[getMetricValueKey(metric)] === -1
      ) {
        continue;
      }

      const metricRecord = currentRecordsMap.get(metric);

      // No record exists for this period and metric, create a new one.
      if (metricRecord === undefined) {
        toCreate.push({
          playerId,
          period,
          metric,
          value: prepareDecimalValue(metric, value)
        });
        continue;
      }

      // A record existed before, and should be updated with a new and greater value
      if (value > metricRecord.value) {
        toUpdate.push({
          metric,
          newValue: prepareDecimalValue(metric, value)
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
