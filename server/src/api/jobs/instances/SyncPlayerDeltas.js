const deltaService = require("../../modules/deltas/delta.service");

module.exports = {
  key: "SyncPlayerDeltas",
  async handle({ data }) {
    const { playerId } = data;
    await deltaService.syncDeltas(playerId);
  }
};
