import { NotFoundError } from '../../api/errors';
import { standardize } from '../../api/modules/players/player.utils';
import { assertPlayerType } from '../../api/modules/players/services/AssertPlayerTypeService';
import prisma from '../../prisma';
import { Job } from '../job.utils';

class CheckPlayerTypeJob extends Job {
  private username: string;

  constructor(username: string) {
    super(username);
    this.username = username;

    this.options = {
      rateLimiter: { max: 1, duration: 5000 },
      attempts: 3,
      backoff: 30_000
    };
  }

  async execute() {
    const player = await prisma.player.findFirst({
      where: { username: standardize(this.username) }
    });

    if (!player) {
      throw new NotFoundError('Player not found.');
    }

    await assertPlayerType(player, true);
  }
}

export { CheckPlayerTypeJob };
