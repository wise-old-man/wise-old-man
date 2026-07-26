import prisma from '../../../../prisma';
import { Snapshot } from '../../../../types';

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
  const snapshots = await prisma.$queryRaw<Snapshot[]>`
    SELECT s.*
    FROM unnest(${playerIds}::int[]) AS p(id)
    CROSS JOIN LATERAL (
      SELECT * FROM public.snapshots
      WHERE "playerId" = p.id AND "createdAt" < ${maxDate}
      ORDER BY "createdAt" DESC
      LIMIT 1
    ) s
`;

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
  const snapshots = await prisma.$queryRaw<Snapshot[]>`
      SELECT s.*
      FROM unnest(${playerIds}::int[]) AS p(id)
      CROSS JOIN LATERAL (
        SELECT * FROM public.snapshots
        WHERE "playerId" = p.id AND "createdAt" > ${minDate}
        ORDER BY "createdAt" ASC
        LIMIT 1
      ) s
  `;

  // For some reason, the raw query returns dates as strings
  return snapshots.map(s => ({
    ...s,
    overallExperience: Number(s.overallExperience),
    createdAt: new Date(s.createdAt),
    importedAt: s.importedAt ? new Date(s.importedAt) : null
  }));
}

export { findGroupSnapshots };
