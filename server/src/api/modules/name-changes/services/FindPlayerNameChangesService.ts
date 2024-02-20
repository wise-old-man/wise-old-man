import prisma, { NameChange, NameChangeStatus } from '../../../../prisma';

async function findPlayerNameChanges(playerId: number): Promise<NameChange[]> {
  // Query the database for all (approved) name changes of "playerId"
  const nameChanges = await prisma.nameChange.findMany({
    where: { playerId, status: NameChangeStatus.APPROVED },
    orderBy: { resolvedAt: 'desc' }
  });

  return nameChanges as NameChange[];
}

export { findPlayerNameChanges };
