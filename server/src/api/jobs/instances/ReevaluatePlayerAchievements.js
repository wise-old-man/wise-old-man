const achievementService = require('../../modules/achievements/achievement.service');

module.exports = {
  name: 'ReevaluatePlayerAchievements',
  async handle({ data }) {
    const { playerId } = data;
    await achievementService.reevaluateAchievements(playerId);
  }
};
