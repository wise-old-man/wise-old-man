import { METRICS } from '../../utils/metrics';
import { Delta } from '../../prisma';
import metrics from '../services/external/metrics.service';
import * as recordServices from '../modules/records/record.services';

async function onDeltaUpdated(delta: Delta) {
  // if (!delta.isPotentialRecord) return;

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
