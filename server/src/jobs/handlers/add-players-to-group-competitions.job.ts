import { eventEmitter, EventType } from '../../api/events';
import prisma from '../../prisma';
import { CompetitionType, Participation } from '../../types';
import { Job } from '../job.class';

interface Payload {
  groupId: number;
  playerIds: number[];
}

export class AddPlayersToGroupCompetitionsJob extends Job<Payload> {
  async execute(payload: Payload) {
    if (payload.playerIds.length === 0) {
      return;
    }

    // Find all upcoming/ongoing competitions for the group
    const groupCompetitions = await prisma.competition.findMany({
      where: {
        groupId: payload.groupId,
        endsAt: { gt: new Date() },
        type: CompetitionType.CLASSIC // shouldn't auto-add players to a team competition
      }
    });

    const newParticipations: Pick<Participation, 'playerId' | 'competitionId'>[] = [];

    groupCompetitions.forEach(gc => {
      payload.playerIds.forEach(playerId => {
        newParticipations.push({ playerId, competitionId: gc.id });
      });
    });

    if (newParticipations.length === 0) {
      return;
    }

    await prisma.participation.createMany({
      data: newParticipations,
      skipDuplicates: true
    });

    const groupedByCompetitionId = new Map<number, number[]>();

    for (const participation of newParticipations) {
      if (!groupedByCompetitionId.has(participation.competitionId)) {
        groupedByCompetitionId.set(participation.competitionId, []);
      }
      groupedByCompetitionId.get(participation.competitionId)?.push(participation.playerId);
    }

    for (const [competitionId, playerIds] of groupedByCompetitionId.entries()) {
      eventEmitter.emit(EventType.COMPETITION_PARTICIPANTS_JOINED, {
        competitionId,
        participants: playerIds.map(playerId => ({
          playerId
        }))
      });
    }
  }
}
