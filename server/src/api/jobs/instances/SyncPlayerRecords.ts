import { PERIODS } from '../../constants';
import * as recordService from '../../modules/records/record.service';
import { Job } from '../index';

class SyncPlayerRecords implements Job {
  name: string;

  constructor() {
    this.name = 'SyncPlayerRecords';
  }

  async handle(data: any): Promise<void> {
    const { playerId } = data;

    await Promise.all(
      PERIODS.map(async period => {
        await recordService.syncRecords(playerId, period);
      })
    );
  }
}

export default new SyncPlayerRecords();
