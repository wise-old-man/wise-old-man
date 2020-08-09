import * as achievementService from '@services/internal/achievements';
import { Job } from '../index';

class ReevaluatePlayerAchievements implements Job {
  name: string;

  constructor() {
    this.name = 'ReevaluatePlayerAchievements';
  }

  async handle(data: any): Promise<void> {
    const { playerId } = data;
    await achievementService.reevaluateAchievements(playerId);
  }
}

export default new ReevaluatePlayerAchievements();
