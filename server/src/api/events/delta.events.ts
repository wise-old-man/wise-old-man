import { Delta } from '../../database/models';
import metrics from '../services/external/metrics.service';
import * as recordService from '../services/internal/record.service';

async function onDeltaUpdated(delta: Delta) {
  if (!delta.isPotentialRecord) return;

  // Check if this new delta is an all time record for this player
  await metrics.measureReaction('SyncRecords', () => recordService.syncRecords(delta));
}

export { onDeltaUpdated };
