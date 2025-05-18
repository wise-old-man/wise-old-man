import { onParticipantsJoined } from '../../api/modules/competitions/competition.events';
import prisma, { Participation } from '../../prisma';
import { CompetitionType } from '../../utils';
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

    await onParticipantsJoined(newParticipations);
  }
}
