import metricsService from '../../services/external/metrics.service';
import * as playerService from '../../services/internal/player.service';
import { Job } from '../index';

class UpdatePlayer implements Job {
  name: string;

  constructor() {
    this.name = 'UpdatePlayer';
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
