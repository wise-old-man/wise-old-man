const achievementService = require('../../modules/achievements/achievement.service');

module.exports = {
  name: 'SyncPlayerAchievements',
  async handle({ data }) {
    const { playerId } = data;
    await achievementService.syncAchievements(playerId);
  }
};
