import logger from '../../services/external/logger.service';
import metricsService from '../../services/external/metrics.service';
import * as playerService from '../../services/internal/player.service';
import { Job } from '../index';

class ReviewPlayerType implements Job {
  name: string;

  constructor() {
    this.name = 'ReviewPlayerType';
  }

  async handle(data: any): Promise<void> {
    const endTimer = metricsService.trackJobStarted();

    try {
      const player = await playerService.findById(data.id);

      const previousType = player.type;
      const newType = await playerService.assertType(player);

      // Player type hasn't changed, player is just inactive
      if (previousType !== newType) {
        logger.info('De-ironed player', { username: player.username, previousType, newType });
      }

      metricsService.trackJobEnded(endTimer, this.name, 1);
    } catch (error) {
      metricsService.trackJobEnded(endTimer, this.name, 0);
      throw error;
    }
  }
}

export default new ReviewPlayerType();
