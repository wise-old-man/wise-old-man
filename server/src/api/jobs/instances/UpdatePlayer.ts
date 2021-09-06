import { RateLimiter } from 'bull';
import metricsService from '../../services/external/metrics.service';
import * as playerService from '../../services/internal/player.service';
import { Job } from '../index';

class UpdatePlayer implements Job {
  name: string;
  rateLimiter: RateLimiter;

  constructor() {
    this.name = 'UpdatePlayer';
    this.rateLimiter = { max: 1, duration: 500 };
  }

  async handle(data: any): Promise<void> {
    if (!data.username) return;

    const endTimer = metricsService.trackJobStarted();

    try {
      await playerService.update(data.username);
      metricsService.trackJobEnded(endTimer, this.name, 1);
    } catch (error) {
      metricsService.trackJobEnded(endTimer, this.name, 0);
      throw error;
    }
  }
}

export default new UpdatePlayer();
