import prisma from '../../../../prisma';

async function fetchTableCounts() {
  const playersCount = await getTableCount('players');
  const snapshotsCount = await getTableCount('snapshots');
  const groupsCount = await getTableCount('groups');
  const competitionsCount = await getTableCount('competitions');

  return {
    players: playersCount,
    snapshots: snapshotsCount,
    groups: groupsCount,
    competitions: competitionsCount
  };
}

async function getTableCount(tableName: string) {
  const result = await prisma.$queryRaw<
    Array<{ estimate: number }>
  >`SELECT reltuples AS estimate FROM pg_class WHERE relname = ${tableName}`;

  if (!result || result.length < 1) return 0;

  return result[0].estimate;
}

export { fetchTableCounts };
