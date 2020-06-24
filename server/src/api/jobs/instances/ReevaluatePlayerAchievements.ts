import { reevaluateAchievements } from '../../modules/achievements/achievement.service';

export default {
  name: 'ReevaluatePlayerAchievements',
  async handle({ data }) {
    const { playerId } = data;
    await reevaluateAchievements(playerId);
  }
};
