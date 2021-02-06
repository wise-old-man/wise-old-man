import { Delta } from '../../database/models';
import * as recordService from '../services/internal/record.service';

async function onDeltaUpdated(delta: Delta) {
  // Check if this new delta is an all time record for this player
  recordService.syncRecords(delta.playerId, delta.period);
}

export { onDeltaUpdated };
