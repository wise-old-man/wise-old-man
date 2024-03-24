import { BadRequestError } from '../../api/errors';
import * as jagexService from '../../api/services/external/jagex.service';
import prisma from '../../prisma';
import { PlayerStatus } from '../../utils';
import jobManager from '../job.manager';
import { Job } from '../job.utils';
import { CheckPlayerBannedJob } from './CheckPlayerBannedJob';

class CheckPlayerRankedJob extends Job {
  private username: string;

  constructor(username: string) {
    super(username);
    this.username = username;

    this.options = {
      rateLimiter: { max: 1, duration: 5_000 },
      attempts: 3,
      backoff: { type: 'exponential', delay: 60_000 } // first attempt after 60 seconds, then 120, and then 240 (total: 7 minutes span)
    };
  }

  async execute() {
    // Since the hiscores are unstable, we can't assume that a 404 error from them is 100% accurate.
    // So, to make sure a player is no longer ranked on the hiscores, we need to make a few attempts,
    // and if all of them fail, then we can be pretty sure that the player is no longer ranked.

    // To avoid false positives due to a hiscores outage, this job has a exponential backoff strategy,
    // meaning that it will retry a few times, with a longer delay between each attempt.

    // Try to fetch stats for this player, let it throw an error if it fails.
    await jagexService.fetchHiscoresData(this.username);
  }

  async onFailedAllAttempts(error: Error): Promise<void> {
    // If it fails every attempt with the "Failed to load hiscores" (400) error message,
    // then we can be pretty sure that the player is unranked.
    if (!(error instanceof BadRequestError) || !error.message.includes('Failed to load hiscores')) return;

    await prisma.player.update({
      where: { username: this.username },
      data: { status: PlayerStatus.UNRANKED }
    });

    // Being unranked could also mean a player is banned, so if we determine
    // that they're not on the hiscores, check if they're banned on RuneMetrics.
    await jobManager.add(new CheckPlayerBannedJob(this.username));
  }
}

export { CheckPlayerRankedJob };
