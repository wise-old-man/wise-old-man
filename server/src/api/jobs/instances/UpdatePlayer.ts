import { JobOptions, RateLimiter } from 'bull';
// import redisService from '../../services/external/redis.service';
// import metricsService from '../../services/external/metrics.service';
// import * as playerService from '../../services/internal/player.service';
import { Job } from '../index';

class UpdatePlayer implements Job {
  name: string;
  rateLimiter: RateLimiter;
  defaultOptions: JobOptions;

  constructor() {
    this.name = 'UpdatePlayer';
    this.rateLimiter = { max: 1, duration: 500 };
    this.defaultOptions = { attempts: 3, backoff: 30_000 };
  }

  async handle(data: any): Promise<void> {
    // Disabled until the league starts
    // if (!data.username) return;
    // const endTimer = metricsService.trackJobStarted();
    // try {
    //   await playerService.update(data.username);
    //   metricsService.trackJobEnded(endTimer, this.name, 1, data.source);
    // } catch (error) {
    //   metricsService.trackJobEnded(endTimer, this.name, 0, data.source);
    //   throw error;
    // } finally {
    //   redisService.deleteKey(`cd:league_UpdatePlayer:${data.username}`);
    // }
  }
}

export default new UpdatePlayer();
