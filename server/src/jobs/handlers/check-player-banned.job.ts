import { isErrored } from '@attio/fetchable';
import { standardize } from '../../api/modules/players/player.utils';
import prisma from '../../prisma';
import { getRuneMetricsBannedStatus } from '../../services/jagex.service';
import logger from '../../services/logging.service';
import { PlayerStatus } from '../../types';
import { JobHandler } from '../types/job-handler.type';

interface Payload {
  username: string;
}

export const CheckPlayerBannedJobHandler: JobHandler<Payload> = {
  options: {
    rateLimiter: {
      max: 1,
      duration: 5000
    },
    backoff: {
      type: 'exponential',
      delay: 600_000
    }
  },

  generateUniqueJobId(payload) {
    return payload.username;
  },

  async execute(payload) {
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
};
