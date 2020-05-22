const deltaService = require('../../modules/deltas/delta.service');

module.exports = {
  key: 'SyncPlayerInitialValues',
  async handle({ data }) {
    const { playerId } = data;
    await deltaService.syncInitialValues(playerId);
  }
};
