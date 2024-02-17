import prisma from '../../../prisma';
import { NotFoundError } from '../../errors';
import { assertPlayerType } from '../../modules/players/services/AssertPlayerTypeService';
import { JobDefinition, JobOptions, JobType } from '../job.types';

export interface AssertPlayerTypePayload {
  playerId: number;
}

class AssertPlayerTypeJob implements JobDefinition<AssertPlayerTypePayload> {
  type: JobType;
  options: JobOptions;

  constructor() {
    this.type = JobType.ASSERT_PLAYER_TYPE;

    this.options = {
      rateLimiter: { max: 1, duration: 5_000 },
      defaultOptions: { attempts: 5, backoff: 30_000 }
    };
  }

  async execute(data: AssertPlayerTypePayload) {
    const player = await prisma.player.findFirst({
      where: { id: data.playerId }
    });

    if (!player) {
      throw new NotFoundError('Player not found.');
    }

    await assertPlayerType(player, true);
  }
}

export default new AssertPlayerTypeJob();
