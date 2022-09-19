import redisService from '../../services/external/redis.service';
import * as playerServices from '../../modules/players/player.services';
import { JobType, JobDefinition } from '../job.types';

// This review should only be executed a maximum of once every 7 days
const REVIEW_COOLDOWN = 604_800_000;

export interface ReviewPlayerTypePayload {
  playerId: number;
}

class ReviewPlayerTypeJob implements JobDefinition<ReviewPlayerTypePayload> {
  type: JobType;

  constructor() {
    this.type = JobType.REVIEW_PLAYER_TYPE;
  }

  async execute(data: ReviewPlayerTypePayload) {
    const [player] = await playerServices.findPlayer({ id: data.playerId });

    await playerServices.assertPlayerType(player, true);

    // Store the current timestamp to activate the cooldown
    await redisService.setValue('cd:PlayerTypeReview', player.username, Date.now(), REVIEW_COOLDOWN);
  }
}

export default new ReviewPlayerTypeJob();
