const competitionService = require('../../modules/competitions/competition.service');

module.exports = {
  key: 'AddToGroupCompetitions',
  async handle({ data }) {
    const { groupId, playerIds } = data;
    await competitionService.addToGroupCompetitions(groupId, playerIds);
  }
};
