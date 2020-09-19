import { Delta } from '../../database/models';
import * as recordService from '../services/internal/record.service';

async function onDeltaUpdated(delta: Delta) {
  if (delta.indicator !== 'value') return;

  recordService.syncRecords(delta.playerId, delta.period);
}

export { onDeltaUpdated };
