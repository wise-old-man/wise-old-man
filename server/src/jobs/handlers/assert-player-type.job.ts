import { NotFoundError } from '../../api/errors';
import { standardize } from '../../api/modules/players/player.utils';
import { assertPlayerType } from '../../api/modules/players/services/AssertPlayerTypeService';
import prisma from '../../prisma';
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

    await assertPlayerType(player, true);
  }
}
