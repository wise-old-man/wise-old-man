const groupService = require('../../modules/groups/group.service');
const competitionService = require('../../modules/competitions/competition.service');

module.exports = {
  name: 'RefreshRankings',
  async handle() {
    await groupService.refreshScores();
    await competitionService.refreshScores();
  }
};
