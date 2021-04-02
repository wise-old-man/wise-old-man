import metricsService from '../../services/external/metrics.service';
import * as playerService from '../../services/internal/player.service';
import { Job } from '../index';

class AssertPlayerName implements Job {
  name: string;

  constructor() {
    this.name = 'AssertPlayerName';
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
