import prisma from '../../prisma';
import { JobHandler } from '../types/job-handler.type';

interface Payload {
  groupId: number;
  playerIds: number[];
}

export const RemovePlayersFromGroupCompetitionsJobHandler: JobHandler<Payload> = {
  async execute(payload) {
    if (payload.playerIds.length === 0) {
      return;
    }

    // Find all upcoming/ongoing competitions for the group
    const groupCompetitions = await prisma.competition.findMany({
      where: {
        groupId: payload.groupId,
        endsAt: { gt: new Date() }
      }
    });

    await prisma.participation.deleteMany({
      where: {
        competitionId: { in: groupCompetitions.map(gc => gc.id) },
        playerId: { in: payload.playerIds }
      }
    });
  }
};
