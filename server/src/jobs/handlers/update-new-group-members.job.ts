import prisma from '../../prisma';
import { PlayerType } from '../../types';
import { Job } from '../job.class';
import { JobType } from '../types/job-type.enum';

interface Payload {
  groupId: number;
  playerIds: number[];
}

export class UpdateNewGroupMembersJob extends Job<Payload> {
  async execute(payload: Payload) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    if (payload.playerIds.length === 0) {
      return;
    }

    const players = await prisma.player.findMany({
      where: { id: { in: payload.playerIds } }
    });

    players.forEach(({ username, type, registeredAt }) => {
      if (type !== PlayerType.UNKNOWN || Date.now() - registeredAt.getTime() > 60_000) {
        return;
      }

      this.jobManager.add(JobType.UPDATE_PLAYER, { username });
    });
  }
}
