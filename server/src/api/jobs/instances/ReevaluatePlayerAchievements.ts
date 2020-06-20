import * as achievementService from '../../modules/achievements/achievement.service';

export default {
  name: 'ReevaluatePlayerAchievements',
  async handle({ data }) {
    const { playerId } = data;
    await achievementService.reevaluateAchievements(playerId);
  }
};
