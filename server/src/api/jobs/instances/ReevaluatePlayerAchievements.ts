import * as achievementService from '../../modules/achievements/achievement.service'

export default {
  key: 'ReevaluatePlayerAchievements',
  async handle({ data }) {
    const { playerId } = data;
    await achievementService.reevaluateAchievements(playerId);
  }
};
