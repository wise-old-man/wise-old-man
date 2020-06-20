import * as recordService from '../../modules/records/record.service';
import { periods } from '../../constants/periods';

export default {
  name: 'SyncPlayerRecords',
  async handle({ data }) {
    const { playerId } = data;

    await Promise.all(
      periods.map(async period => {
        await recordService.syncRecords(playerId, period);
      })
    );
  }
};
