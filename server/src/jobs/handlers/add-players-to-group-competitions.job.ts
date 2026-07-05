import { eventEmitter, EventType } from '../../api/events';
import prisma from '../../prisma';
import { CompetitionType, Participation, PlayerAnnotationType } from '../../types';
import { JobHandler } from '../types/job-handler.type';

interface Payload {
  groupId: number;
  playerIds: number[];
}

export const AddPlayersToGroupCompetitionsJobHandler: JobHandler<Payload> = {
  async execute(payload) {
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

    const [optOuts, memberships] = await Promise.all([
      prisma.playerAnnotation.findMany({
        where: {
          playerId: { in: payload.playerIds },
          type: { in: [PlayerAnnotationType.OPT_OUT, PlayerAnnotationType.OPT_OUT_COMPETITIONS] }
        }
      }),
      prisma.membership.findMany({
        where: { groupId: payload.groupId, playerId: { in: payload.playerIds } }
      })
    ]);

    // Players who opted out after joining the group are grandfathered in and may still participate.
    const blockedPlayerIds = new Set(
      optOuts
        .filter(o => {
          if (o.type === PlayerAnnotationType.OPT_OUT) return true;

          const membership = memberships.find(m => m.playerId === o.playerId);
          if (!membership) return true;

          return o.createdAt <= membership.createdAt;
        })
        .map(o => o.playerId)
    );

    const allowedPlayerIds = payload.playerIds.filter(id => !blockedPlayerIds.has(id));

    const newParticipations: Pick<Participation, 'playerId' | 'competitionId'>[] = [];

    groupCompetitions.forEach(gc => {
      allowedPlayerIds.forEach(playerId => {
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
};
