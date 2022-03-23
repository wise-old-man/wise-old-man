import { Delta } from '../../database/models';
import { Period, METRICS } from '@wise-old-man/utils';
import { PeriodEnum } from '../../prisma';
import metrics from '../services/external/metrics.service';
import * as recordServices from '../modules/records/record.services';

async function onDeltaUpdated(delta: Delta) {
  if (!delta.isPotentialRecord) return;

  // Check if this new delta is an all time record for this player
  // TODO: fix this when the deltas are updated to the new prisma standards
  await metrics.measureReaction('SyncRecords', async () => {
    await recordServices.syncPlayerRecords({
      id: delta.playerId,
      period: delta.period === Period.FIVE_MIN ? PeriodEnum.FIVE_MIN : (delta.period as any),
      metricDeltas: METRICS.map(m => ({ metric: m, value: Number(delta[m] as any) }))
    });
  });
}

export { onDeltaUpdated };
