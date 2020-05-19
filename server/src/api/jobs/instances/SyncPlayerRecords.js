const recordService = require('../../modules/records/record.service');
const PERIODS = require('../../constants/periods');

module.exports = {
  key: 'SyncPlayerRecords',
  async handle({ data }) {
    const { playerId } = data;

    await Promise.all(
      PERIODS.map(async period => {
        console.log('syncing', period, playerId);
        await recordService.syncRecords(playerId, period);
      })
    );
  }
};
