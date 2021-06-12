import { RateLimiter } from 'bull';
import metricsService from '../../services/external/metrics.service';
import * as playerService from '../../services/internal/player.service';
import { Job } from '../index';

class AssertPlayerName implements Job {
  name: string;
  rateLimiter: RateLimiter;

  constructor() {
    this.name = 'AssertPlayerName';
    this.rateLimiter = { max: 1, duration: 15_000 };
  }

  async handle(data: any): Promise<void> {
    const endTimer = metricsService.trackJobStarted();

    try {
      const player = await playerService.resolve({ id: data.id });
      await playerService.assertName(player);

      metricsService.trackJobEnded(endTimer, this.name, 1);
    } catch (error) {
      metricsService.trackJobEnded(endTimer, this.name, 0);
      throw error;
    }
  }
}

export default new AssertPlayerName();
