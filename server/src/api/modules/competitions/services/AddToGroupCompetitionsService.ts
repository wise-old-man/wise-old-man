import prisma, { Participation } from '../../../../prisma';
import { CompetitionType } from '../../../../utils';
import { onParticipantsJoined } from '../competition.events';

async function addToGroupCompetitions(groupId: number, playerIds: number[]): Promise<void> {
  // Find all upcoming/ongoing competitions for the group
  const groupCompetitions = await prisma.competition.findMany({
    where: {
      groupId,
      endsAt: { gt: new Date() },
      type: CompetitionType.CLASSIC // shouldn't auto-add players to a team competition
    }
  });

  const newParticipations: Pick<Participation, 'playerId' | 'competitionId'>[] = [];

  groupCompetitions.forEach(gc => {
    playerIds.forEach(playerId => {
      newParticipations.push({ playerId, competitionId: gc.id });
    });
  });

  if (newParticipations.length === 0) {
    return;
  }

  await prisma.participation.createMany({ data: newParticipations, skipDuplicates: true });

  onParticipantsJoined(newParticipations);
}

export { addToGroupCompetitions };
