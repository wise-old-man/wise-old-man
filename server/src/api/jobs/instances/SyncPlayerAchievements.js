const achievementService = require("../../modules/achievements/achievement.service");

module.exports = {
  key: "SyncPlayerAchievements",
  async handle({ data }) {
    const { playerId } = data;
    await achievementService.syncAchievements(playerId);
  }
};
