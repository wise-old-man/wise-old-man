const competitionService = require('../../modules/competitions/competition.service');

module.exports = {
  key: 'SyncPlayerParticipations',
  async handle({ data }) {
    const { playerId } = data;
    await competitionService.syncParticipations(playerId);
  },
};
