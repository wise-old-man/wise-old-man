import prisma from '../../../prisma';
import { PlayerStatus } from '../../../utils';
import { checkIsBanned } from '../../services/external/jagex.service';
import { standardize } from '../../modules/players/player.utils';
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
    const username = standardize(data.username);

    const player = await prisma.player.findFirst({
      where: { username }
    });
    if (!player) return;
    const isBanned = await checkIsBanned(username);
    if (player.status === PlayerStatus.UNRANKED && isBanned) {
      await prisma.player.update({
        where: { username },
        data: { status: PlayerStatus.BANNED }
      });
    } else if (player.status === PlayerStatus.BANNED && !isBanned) {
      await prisma.player.update({
        where: { username },
        data: { status: PlayerStatus.UNRANKED }
      });
    }
  }
}

export default new CheckPlayerBannedJob();
