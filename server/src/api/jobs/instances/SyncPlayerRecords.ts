import * as recordService from '../../services/internal/record.service';
import { Job } from '../index';

class SyncPlayerRecords implements Job {
  name: string;

  constructor() {
    this.name = 'SyncPlayerRecords';
  }

  async handle(data: any): Promise<void> {
    const { playerId, period } = data;

    if (playerId && period) {
      await recordService.syncRecords(playerId, period);
    }
  }
}

export default new SyncPlayerRecords();
