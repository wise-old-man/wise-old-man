import prisma from '../../../prisma';
import { PlayerStatus } from '../../../utils';
import { checkIsBanned } from '../../services/external/jagex.service';
import * as playerServices from '../../modules/players/player.services';
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

    const [player] = await playerServices.findPlayer({ username });
    if (!player) return;

    const isBanned = await checkIsBanned(username);

    if (player.status === PlayerStatus.UNRANKED && isBanned) {
      await prisma.player.update({
        where: { username: data.username },
        data: { status: PlayerStatus.BANNED }
      });
    } else if (player.status === PlayerStatus.BANNED && !isBanned) {
      await prisma.player.update({
        where: { username: data.username },
        data: { status: PlayerStatus.UNRANKED }
      });
    }
  }
}

export default new CheckPlayerBannedJob();
