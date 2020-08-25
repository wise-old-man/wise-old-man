import { Delta } from '../../database/models';
import jobs from '../jobs';

async function onDeltaUpdated(delta: Delta) {
  if (delta.indicator === 'value') {
    jobs.add('SyncPlayerRecords', { playerId: delta.playerId, period: delta.period });
  }
}

export { onDeltaUpdated };
