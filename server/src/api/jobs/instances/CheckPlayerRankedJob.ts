import prisma from '../../../prisma';
import { PlayerStatus } from '../../../utils';
import { BadRequestError } from '../../errors';
import * as jagexService from '../../services/external/jagex.service';
import jobManager from '../job.manager';
import { JobType, JobDefinition, JobOptions } from '../job.types';

export interface CheckPlayerRankedPayload {
  username: string;
}

class CheckPlayerRankedJob implements JobDefinition<CheckPlayerRankedPayload> {
  type: JobType;
  options: JobOptions;

  constructor() {
    this.type = JobType.CHECK_PLAYER_RANKED;

    this.options = {
      rateLimiter: { max: 1, duration: 5_000 },
      defaultOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 60_000 } // first attempt after 60 seconds, then 120, and then 240 (total: 7 minutes span)
      }
    };
  }

  async execute(data: CheckPlayerRankedPayload) {
    const { username } = data;

    // Since the hiscores are unstable, we can't assume that a 404 error from them is 100% accurate.
    // So, to make sure a player is no longer ranked on the hiscores, we need to make a few attempts,
    // and if all of them fail, then we can be pretty sure that the player is no longer ranked.

    // To avoid false positives due to a hiscores outage, this job has a exponential backoff strategy,
    // meaning that it will retry a few times, with a longer delay between each attempt.

    // Try to fetch stats for this player, let it throw an error if it fails.
    await jagexService.fetchHiscoresData(username);
  }

  async onFailedAllAttempts(data: CheckPlayerRankedPayload, error: Error) {
    // If it fails every attempt with the "Failed to load hiscores" (400) error message,
    // then we can be pretty sure that the player is unranked.
    if (!(error instanceof BadRequestError) || !error.message.includes('Failed to load hiscores')) return;

    await prisma.player.update({
      where: { username: data.username },
      data: { status: PlayerStatus.UNRANKED }
    });

    // Being unranked could also mean a player is banned, so if we determine
    // that they're not on the hiscores, check if they're banned on RuneMetrics.
    jobManager.add({
      type: JobType.CHECK_PLAYER_BANNED,
      payload: { username: data.username }
    });
  }
}

export default new CheckPlayerRankedJob();
