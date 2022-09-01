import { METRICS } from '../../../utils';
import { Delta } from '../../../prisma';
import metrics from '../../services/external/metrics.service';
import * as recordServices from '../records/record.services';

async function onDeltaUpdated(delta: Delta, isPotentialRecord: boolean) {
  if (!isPotentialRecord) return;

  // Check if this new delta is an all time record for this player
  await metrics.measureReaction('SyncRecords', async () => {
    await recordServices.syncPlayerRecords({
      id: delta.playerId,
      period: delta.period,
      metricDeltas: METRICS.map(m => ({ metric: m, value: Number(delta[m]) }))
    });
  });
}

export { onDeltaUpdated };
