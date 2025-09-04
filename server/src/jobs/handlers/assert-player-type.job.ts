import { isErrored } from '@attio/fetchable';
import { NotFoundError } from '../../api/errors';
import { standardize } from '../../api/modules/players/player.utils';
import { assertPlayerType } from '../../api/modules/players/services/AssertPlayerTypeService';
import prisma from '../../prisma';
import { assertNever } from '../../utils/assert-never.util';
import { Job } from '../job.class';
import { JobOptions } from '../types/job-options.type';

interface Payload {
  username: string;
}

export class AssertPlayerTypeJob extends Job<Payload> {
  static options: JobOptions = {
    backoff: 30_000,
    rateLimiter: { max: 1, duration: 5000 }
  };

  static getUniqueJobId(payload: Payload) {
    return payload.username;
  }

  async execute(payload: Payload): Promise<void> {
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
}
