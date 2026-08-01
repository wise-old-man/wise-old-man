import { POST_RELEASE_HISCORE_ADDITIONS } from '../../api/modules/snapshots/snapshot.utils';
import prisma from '../../prisma';
import { Metric, METRICS, Period } from '../../types';
import { getMetricValueKey } from '../../utils/get-metric-value-key.util';
import { selectRequiredSnapshotFields } from '../../utils/get-required-snapshot-fields.util';
import { prepareDecimalValue } from '../../utils/prepare-decimal-value.util';
import { JobHandler } from '../types/job-handler.type';

interface Payload {
  username: string;
  period: Period;
}

export const SyncPlayerRecordsJobHandler: JobHandler<Payload> = {
  options: {
    maxConcurrent: 4
  },

  generateUniqueJobId(payload) {
    return [payload.username, payload.period].join('_');
  },

  async execute(payload: Payload) {
    const currentDeltas = await prisma.cachedDelta.findMany({
      where: {
        player: {
          username: payload.username
        },
        period: payload.period
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
          period: payload.period
        }
      }),
      prisma.snapshot.findFirst({
        select: selectRequiredSnapshotFields(METRICS), // Only select value fields, not ranks
        where: {
          playerId,
          createdAt: currentDeltas[0].startedAt
        }
      })
    ]);

    if (previousSnapshot === null) {
      return;
    }

    const currentDeltasMap = new Map(currentDeltas.map(d => [d.metric, d]));
    const currentRecordsMap = new Map(currentRecords.map(r => [r.metric, r]));

    const toUpsert: { metric: Metric; value: number }[] = [];

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

      // Either no record exists for this period and metric, or one existed before
      // and should be updated with a new and greater value.
      if (metricRecord === undefined || value > metricRecord.value) {
        toUpsert.push({
          metric,
          value: prepareDecimalValue(metric, value)
        });
      }
    }

    if (toUpsert.length === 0) {
      return;
    }

    await prisma.$executeRaw`
      INSERT INTO public.records ("playerId", "period", "metric", "value", "updatedAt")
      SELECT ${playerId}, ${payload.period}::period, r.metric, r.value, NOW()
      FROM UNNEST(
        ${toUpsert.map(u => u.metric)}::metric[],
        ${toUpsert.map(u => u.value)}::bigint[]
      ) AS r(metric, value)
      ON CONFLICT ("playerId", "period", "metric")
      DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = NOW()
    `;
  }
};
