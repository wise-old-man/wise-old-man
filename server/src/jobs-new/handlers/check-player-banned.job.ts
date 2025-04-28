import { isErrored } from '@attio/fetchable';
import { standardize } from '../../api/modules/players/player.utils';
import { getRuneMetricsBannedStatus } from '../../api/services/external/jagex.service';
import logger from '../../api/util/logging';
import prisma from '../../prisma';
import { PlayerStatus } from '../../utils';
import type { JobManager } from '../job-manager';
import { Job } from '../job.class';

interface Payload {
  username: string;
}

export class CheckPlayerBannedJob extends Job<Payload> {
  constructor(jobManager: JobManager) {
    super(jobManager);

    this.options = {
      rateLimiter: { max: 1, duration: 5000 }
    };
  }

  async execute(payload: Payload) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const username = standardize(payload.username);

    const player = await prisma.player.findFirst({
      where: { username }
    });

    if (!player) return;

    const bannedStatusResult = await getRuneMetricsBannedStatus(username);

    if (isErrored(bannedStatusResult)) {
      logger.error(`Failed to get banned status for ${username}`, bannedStatusResult.error);
      throw bannedStatusResult.error;
    }

    if (player.status === PlayerStatus.UNRANKED && bannedStatusResult.value.isBanned) {
      await prisma.player.update({
        where: { username },
        data: { status: PlayerStatus.BANNED }
      });
      return;
    }

    if (player.status === PlayerStatus.BANNED && !bannedStatusResult.value.isBanned) {
      await prisma.player.update({
        where: { username },
        data: { status: PlayerStatus.UNRANKED }
      });
    }
  }
}
