import { Delta } from '../../../prisma';
import metrics from '../../services/external/metrics.service';
import { syncPlayerRecords } from '../records/services/SyncPlayerRecordsService';

async function onDeltaUpdated(delta: Delta, isPotentialRecord: boolean) {
  if (!isPotentialRecord) return;

  // Check if this new delta is an all time record for this player
  await metrics.trackEffect(syncPlayerRecords, delta);
}

export { onDeltaUpdated };
