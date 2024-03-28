import { standardize } from '../../api/modules/players/player.utils';
import { checkIsBanned } from '../../api/services/external/jagex.service';
import prisma from '../../prisma';
import { PlayerStatus } from '../../utils';
import type { JobManager } from '../job.manager';
import { Job } from '../job.utils';

type CheckPlayerBannedJobPayload = {
  username: string;
};

export class CheckPlayerBannedJob extends Job<CheckPlayerBannedJobPayload> {
  constructor(jobManager: JobManager) {
    super(jobManager);
    this.options.rateLimiter = { max: 1, duration: 5000 };
  }

  async execute(payload: CheckPlayerBannedJobPayload) {
    const username = standardize(payload.username);

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
      return;
    }

    if (player.status === PlayerStatus.BANNED && !isBanned) {
      await prisma.player.update({
        where: { username },
        data: { status: PlayerStatus.UNRANKED }
      });
    }
  }
}
