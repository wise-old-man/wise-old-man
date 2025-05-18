import prisma from '../../prisma';
import { Job } from '../job.class';

interface Payload {
  groupId: number;
  playerIds: number[];
}

export class RemovePlayersFromGroupCompetitionsJob extends Job<Payload> {
  async execute(payload: Payload) {
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
}
