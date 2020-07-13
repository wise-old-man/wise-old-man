import { PERIODS } from '../../constants';
import { syncRecords } from '../../modules/records/record.service';

export default {
  name: 'SyncPlayerRecords',
  async handle({ data }) {
    const { playerId } = data;

    await Promise.all(
      PERIODS.map(async period => {
        await syncRecords(playerId, period);
      })
    );
  }
};
