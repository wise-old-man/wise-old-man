import prisma from '../../../../prisma';

async function removeFromGroupCompetitions(groupId: number, playerIds: number[]): Promise<void> {
  // Find all upcoming/ongoing competitions for the group
  const groupCompetitions = await prisma.competition.findMany({
    where: {
      groupId,
      endsAt: { gt: new Date() }
    }
  });

  await prisma.participation.deleteMany({
    where: {
      competitionId: { in: groupCompetitions.map(gc => gc.id) },
      playerId: { in: playerIds }
    }
  });
}

export { removeFromGroupCompetitions };
