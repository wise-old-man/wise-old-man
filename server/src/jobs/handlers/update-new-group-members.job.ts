import prisma from '../../prisma';
import { PlayerType } from '../../types';
import { JobHandler } from '../types/job-handler.type';
import { JobType } from '../types/job-type.enum';

interface Payload {
  groupId: number;
  playerIds: number[];
}

export const UpdateNewGroupMembersJobHandler: JobHandler<Payload> = {
  async execute(payload, context) {
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

      context.jobManager.add(JobType.UPDATE_PLAYER, { username });
    });
  }
};
