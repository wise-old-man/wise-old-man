import prisma, { PrismaTypes, Snapshot } from '../../../../prisma';

async function findGroupSnapshots(
  playerIds: number[],
  query: { minDate: Date } | { maxDate: Date }
): Promise<Snapshot[]> {
  if (playerIds.length === 0) {
    return [];
  }

  if ('minDate' in query) {
    // Get the first snapshot AFTER min date (for each player id)
    return await getFirstSnapshot(playerIds, query.minDate);
  }

  // Get the last snapshot BEFORE max date (for each player id)
  return await getLastSnapshot(playerIds, query.maxDate);
}

/**
 * Gets the last snapshot (before maxDate) for each playerId
 */
async function getLastSnapshot(playerIds: number[], maxDate: Date): Promise<Snapshot[]> {
  const formattedPlayerIds = PrismaTypes.join(playerIds, ',');

  const snapshots = await prisma.$queryRaw<Snapshot[]>`
      SELECT s.*, s."playerId", s."createdAt"
      FROM (SELECT q."playerId", MAX(q."createdAt") AS max_date
            FROM public.snapshots q
            WHERE q."playerId" IN (${formattedPlayerIds}) AND q."createdAt" < ${maxDate}
            GROUP BY q."playerId"
          ) r
      JOIN public.snapshots s ON s."playerId" = r."playerId" AND s."createdAt" = r.max_date`;

  // For some reason, the raw query returns dates as strings
  return snapshots.map(s => ({
    ...s,
    overallExperience: Number(s.overallExperience),
    createdAt: new Date(s.createdAt),
    importedAt: s.importedAt ? new Date(s.importedAt) : null
  }));
}

/**
 * Gets the first snapshot (after minDate) for each playerId
 */
async function getFirstSnapshot(playerIds: number[], minDate: Date): Promise<Snapshot[]> {
  const formattedPlayerIds = PrismaTypes.join(playerIds, ',');

  const snapshots = await prisma.$queryRaw<Snapshot[]>`
      SELECT s.*, s."playerId", s."createdAt"
      FROM (SELECT q."playerId", MIN(q."createdAt") AS min_date
            FROM public.snapshots q
            WHERE q."playerId" IN (${formattedPlayerIds}) AND q."createdAt" > ${minDate}
            GROUP BY q."playerId"
          ) r
      JOIN public.snapshots s ON s."playerId" = r."playerId" AND s."createdAt" = r.min_date`;

  // For some reason, the raw query returns dates as strings
  return snapshots.map(s => ({
    ...s,
    overallExperience: Number(s.overallExperience),
    createdAt: new Date(s.createdAt),
    importedAt: s.importedAt ? new Date(s.importedAt) : null
  }));
}

export { findGroupSnapshots };
