const groupService = require('../../modules/groups/group.service');

module.exports = {
  name: 'RefreshRankings',
  async handle() {
    await groupService.refreshScores();
  }
};
