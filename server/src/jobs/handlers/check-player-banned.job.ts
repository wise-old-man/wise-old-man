import { isErrored } from '@attio/fetchable';
import { standardize } from '../../api/modules/players/player.utils';
import prisma from '../../prisma';
import { getRuneMetricsBannedStatus } from '../../services/jagex.service';
import logger from '../../services/logging.service';
import { PlayerStatus } from '../../types';
import { Job } from '../job.class';
import { JobOptions } from '../types/job-options.type';

interface Payload {
  username: string;
}

export class CheckPlayerBannedJob extends Job<Payload> {
  static options: JobOptions = {
    rateLimiter: {
      max: 1,
      duration: 5000
    },
    backoff: {
      type: 'exponential',
      delay: 600_000
    }
  };

  static getUniqueJobId(payload: Payload) {
    return payload.username;
  }

  async execute(payload: Payload) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const username = standardize(payload.username);

    const player = await prisma.player.findFirst({
      where: { username }
    });

    if (!player) {
      return;
    }

    const bannedStatusResult = await getRuneMetricsBannedStatus(username);

    if (isErrored(bannedStatusResult)) {
      logger.error(`Failed to get banned status for ${username}`, bannedStatusResult.error);
      throw bannedStatusResult.error;
    }

    const { isBanned } = bannedStatusResult.value;

    if (player.status === PlayerStatus.UNRANKED && isBanned) {
      await prisma.player.update({
        where: { username },
        data: { status: PlayerStatus.BANNED }
      });
      return;
    }

    if (player.status === PlayerStatus.BANNED && !isBanned) {
      await prisma.player.update({
        where: { username },
        data: { status: PlayerStatus.UNRANKED }
      });
    }
  }
}
