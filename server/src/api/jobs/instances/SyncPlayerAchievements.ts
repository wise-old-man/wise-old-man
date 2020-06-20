import * as achievementService from '../../modules/achievements/achievement.service';

export default {
  name: 'SyncPlayerAchievements',
  async handle({ data }) {
    const { playerId } = data;
    await achievementService.syncAchievements(playerId);
  }
};
