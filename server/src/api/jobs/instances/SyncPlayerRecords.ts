import * as recordService from '../../modules/records/record.service';
import PERIODS from '../../constants/periods';

export default {
  key: 'SyncPlayerRecords',
  async handle({ data }) {
    const { playerId } = data;

    await Promise.all(
      PERIODS.map(async period => {
        await recordService.syncRecords(playerId, period);
      })
    );
  }
};
