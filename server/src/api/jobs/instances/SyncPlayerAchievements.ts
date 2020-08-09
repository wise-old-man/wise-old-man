import * as achievementService from '@services/internal/achievements';
import { Job } from '../index';

class SyncPlayerAchievements implements Job {
  name: string;

  constructor() {
    this.name = 'SyncPlayerAchievements';
  }

  async handle(data: any): Promise<void> {
    const { playerId } = data;
    await achievementService.syncAchievements(playerId);
  }
}

export default new SyncPlayerAchievements();
