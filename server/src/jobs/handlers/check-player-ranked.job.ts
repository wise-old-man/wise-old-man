import { isComplete } from '@attio/fetchable';
import prisma from '../../prisma';
import { fetchHiscoresJSON } from '../../services/jagex.service';
import { PlayerStatus } from '../../types';
import { assertNever } from '../../utils/assert-never.util';
import { JobHandler, JobHandlerContext } from '../types/job-handler.type';
import { JobType } from '../types/job-type.enum';

const MAX_CHECK_ATTEMPTS = 5;

interface Payload {
  username: string;
  attempts?: number;
}

export const CheckPlayerRankedJobHandler: JobHandler<Payload> = {
  options: {
    rateLimiter: {
      max: 1,
      duration: 5_000
    }
  },

  generateUniqueJobId(payload) {
    return [payload.username, payload.attempts ?? 0].join('_');
  },

  async execute(payload, context) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    // Since the hiscores are unstable, we can't assume that a 404 error from them is 100% accurate.
    // So, to make sure a player is no longer ranked on the hiscores, we need to make a few attempts,
    // and if all of them fail, then we can be pretty sure that the player is no longer ranked.

    // To avoid false positives due to a hiscores outage, this job enqueues the next check
    // with a exponential backoff strategy, meaning that it will retry a few times,
    // with a longer delay between each attempt.

    const fetchResult = await fetchHiscoresJSON(payload.username);

    if (isComplete(fetchResult)) {
      return;
    }

    switch (fetchResult.error.code) {
      case 'HISCORES_SERVICE_UNAVAILABLE':
      case 'HISCORES_UNEXPECTED_ERROR':
        throw fetchResult.error;
      case 'HISCORES_USERNAME_NOT_FOUND': {
        await handleNotFound(payload, context);
        break;
      }
      default:
        return assertNever(fetchResult.error);
    }
  }
};

async function handleNotFound(payload: Payload, context: JobHandlerContext) {
  if ((payload.attempts ?? 0) + 1 >= MAX_CHECK_ATTEMPTS) {
    // If it fails every attempt with the "Failed to load hiscores" (400) error message,
    // then we can be pretty sure that the player is unranked.
    await prisma.player.update({
      where: {
        username: payload.username
      },
      data: {
        status: PlayerStatus.UNRANKED
      }
    });

    // Being unranked could also mean a player is banned, so if we determine
    // that they're not on the hiscores, check if they're banned on RuneMetrics.
    context.jobManager.add(JobType.CHECK_PLAYER_BANNED, { username: payload.username });

    return;
  }

  const nextDelay = 2 ** (payload.attempts ?? 0) * 60 * 1000; // Exponential backoff: 1m, 2m, 4m, 8m

  context.jobManager.add(
    JobType.CHECK_PLAYER_RANKED,
    {
      username: payload.username,
      attempts: (payload.attempts ?? 0) + 1
    },
    { delay: nextDelay }
  );
}
