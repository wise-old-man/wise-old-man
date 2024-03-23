import { Delta } from '../../../prisma';
import prometheus from '../../services/external/prometheus.service';
import { syncPlayerRecords } from '../records/services/SyncPlayerRecordsService';

async function onDeltaUpdated(delta: Delta, isPotentialRecord: boolean) {
  if (!isPotentialRecord) return;

  // Check if this new delta is an all time record for this player
  await prometheus.trackEffect('syncPlayerRecords', async () => {
    await syncPlayerRecords(delta);
  });
}

export { onDeltaUpdated };
