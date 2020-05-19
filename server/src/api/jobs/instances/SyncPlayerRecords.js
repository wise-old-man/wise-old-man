const recordService = require('../../modules/records/record.service');
const PERIODS = require('../../constants/periods');

module.exports = {
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
