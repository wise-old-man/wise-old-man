import prisma from '../../../prisma';
import { PlayerStatus } from '../../../utils';
import { checkIsBanned } from '../../services/external/jagex.service';
import { JobType, JobDefinition, JobOptions } from '../job.types';

export interface CheckPlayerBannedPayload {
  username: string;
}

class CheckPlayerBannedJob implements JobDefinition<CheckPlayerBannedPayload> {
  type: JobType;
  options: JobOptions;

  constructor() {
    this.type = JobType.CHECK_PLAYER_BANNED;
    this.options = { rateLimiter: { max: 1, duration: 5_000 } };
  }

  async execute(data: CheckPlayerBannedPayload) {
    const { username } = data;

    if (await checkIsBanned(username)) {
      await prisma.player.update({
        where: { username: data.username },
        data: { status: PlayerStatus.BANNED }
      });
    }
  }
}

export default new CheckPlayerBannedJob();
