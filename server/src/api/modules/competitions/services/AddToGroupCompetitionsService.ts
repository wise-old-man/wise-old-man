import prisma from '../../../../prisma';
import { CompetitionType } from '../../../../utils';

async function addToGroupCompetitions(groupId: number, playerIds: number[]): Promise<void> {
  // Find all upcoming/ongoing competitions for the group
  const groupCompetitions = await prisma.competition.findMany({
    where: {
      groupId,
      endsAt: { gt: new Date() },
      type: CompetitionType.CLASSIC // shouldn't auto-add players to a team competition
    }
  });

  const newParticipations = [];

  groupCompetitions.forEach(gc => {
    playerIds.forEach(playerId => {
      newParticipations.push({ playerId, competitionId: gc.id });
    });
  });

  await prisma.participation.createMany({ data: newParticipations, skipDuplicates: true });
}

export { addToGroupCompetitions };
