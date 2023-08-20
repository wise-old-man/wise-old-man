import prisma from '../../../prisma';
import * as playerServices from '../../modules/players/player.services';
import { NotFoundError } from '../../errors';
import { JobType, JobDefinition, JobOptions } from '../job.types';

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

    await playerServices.assertPlayerType(player, true);
  }
}

export default new AssertPlayerTypeJob();
