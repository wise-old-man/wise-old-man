import prisma from '../../../prisma';
import { PlayerStatus } from '../../../utils';
import { BadRequestError } from '../../errors';
import * as jagexService from '../../services/external/jagex.service';
import { JobType, JobDefinition, JobOptions } from '../job.types';

export interface CheckPlayerRankingPayload {
  username: string;
}

class CheckPlayerRankingJob implements JobDefinition<CheckPlayerRankingPayload> {
  type: JobType;
  options: JobOptions;

  constructor() {
    this.type = JobType.CHECK_PLAYER_RANKING;

    this.options = {
      rateLimiter: { max: 1, duration: 5_000 },
      defaultOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 60_000 } // first attempt after 60 seconds, then 120, and then 240 (total: 7 minutes span)
      }
    };
  }

  async execute(data: CheckPlayerRankingPayload) {
    const { username } = data;

    // Since the hiscores are unstable, we can't assume that a 404 error from them is 100% accurate.
    // So, to make sure a player is no longer ranked on the hiscores, we need to make a few attempts,
    // and if all of them fail, then we can be pretty sure that the player is no longer ranked.

    // To avoid false positives due to a hiscores outage, this job has a exponential backoff strategy,
    // meaning that it will retry a few times, with a longer delay between each attempt.

    // Try to fetch stats for this player, let it throw an error if it fails.
    await jagexService.getHiscoresData(username);
  }

  async onFailedAllAttempts(data: CheckPlayerRankingPayload, error: Error) {
    // If it fails every attempt with the "Failed to load hiscores" (404) error message,
    // then yea, we can be pretty sure that the player is unranked.
    if (error instanceof BadRequestError && error.message.includes('Failed to load hiscores')) {
      await prisma.player.update({
        where: { username: data.username },
        data: { status: PlayerStatus.UNRANKED }
      });
    }
  }
}

export default new CheckPlayerRankingJob();
