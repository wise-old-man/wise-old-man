const recordService = require('../../modules/records/record.service');

module.exports = {
  key: 'SyncPlayerRecords',
  async handle({ data }) {
    const { playerId, period } = data;
    await recordService.syncRecords(playerId, period);
  },
};
