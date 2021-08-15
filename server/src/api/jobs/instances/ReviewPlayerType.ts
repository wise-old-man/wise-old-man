import metricsService from '../../services/external/metrics.service';
import redisService from '../../services/external/redis.service';
import * as playerService from '../../services/internal/player.service';
import { Job } from '../index';

// This review should only be executed a maximum of once every 7 days
const REVIEW_COOLDOWN = 604_800_000;

class ReviewPlayerType implements Job {
  name: string;

  constructor() {
    this.name = 'ReviewPlayerType';
  }

  async handle(data: any): Promise<void> {
    const endTimer = metricsService.trackJobStarted();

    try {
      const player = await playerService.findById(data.id);
      await playerService.assertType(player);

      // Store the current timestamp to activate the cooldown
      await redisService.setValue('cd:PlayerTypeReview', player.username, Date.now(), REVIEW_COOLDOWN);

      metricsService.trackJobEnded(endTimer, this.name, 1);
    } catch (error) {
      metricsService.trackJobEnded(endTimer, this.name, 0);
      throw error;
    }
  }
}

export default new ReviewPlayerType();
