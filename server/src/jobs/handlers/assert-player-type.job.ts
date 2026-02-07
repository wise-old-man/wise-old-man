import { isErrored } from '@attio/fetchable';
import { NotFoundError } from '../../api/errors';
import { standardize } from '../../api/modules/players/player.utils';
import { assertPlayerType } from '../../api/modules/players/services/AssertPlayerTypeService';
import prisma from '../../prisma';
import { assertNever } from '../../utils/assert-never.util';
import { JobHandler } from '../types/job-handler.type';

interface Payload {
  username: string;
}

export const AssertPlayerTypeJobHandler: JobHandler<Payload> = {
  options: {
    backoff: 30_000,
    rateLimiter: { max: 1, duration: 5000 }
  },

  generateUniqueJobId(payload) {
    return payload.username;
  },

  async execute(payload) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const player = await prisma.player.findFirst({
      where: { username: standardize(payload.username) }
    });

    if (!player) {
      throw new NotFoundError('Player not found.');
    }

    const assertionResult = await assertPlayerType(player);

    if (isErrored(assertionResult)) {
      switch (assertionResult.error.code) {
        case 'HISCORES_SERVICE_UNAVAILABLE':
        case 'HISCORES_UNEXPECTED_ERROR':
          // throw here to retry the job
          throw assertionResult.error;
        case 'HISCORES_USERNAME_NOT_FOUND':
          break;
        default:
          assertNever(assertionResult.error);
      }
    }
  }
};
