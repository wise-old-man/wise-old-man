import { JobOptions, RateLimiter } from 'bull';
import metricsService from '../../services/external/metrics.service';
import * as playerServices from '../../modules/players/player.services';
import { NotFoundError } from '../../errors';
import { Job } from '../index';

class AssertPlayerType implements Job {
  name: string;
  rateLimiter: RateLimiter;
  defaultOptions: JobOptions;

  constructor() {
    this.name = 'AssertPlayerType';
    this.rateLimiter = { max: 1, duration: 5_000 };
    this.defaultOptions = { attempts: 5, backoff: 30_000 };
  }

  async handle(data: any): Promise<void> {
    const endTimer = metricsService.trackJobStarted();

    try {
      const [player] = await playerServices.findPlayer({ id: data.id });

      if (!player) {
        throw new NotFoundError('Player not found.');
      }

      await playerServices.assertPlayerType(player, true);
      metricsService.trackJobEnded(endTimer, this.name, 1);
    } catch (error) {
      metricsService.trackJobEnded(endTimer, this.name, 0);
      throw error;
    }
  }
}

export default new AssertPlayerType();
