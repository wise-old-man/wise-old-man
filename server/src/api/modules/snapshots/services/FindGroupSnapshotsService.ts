import prisma, { PrismaTypes } from '../../../../prisma';
import { Snapshot } from '../../../../types';

export async function findGroupSnapshots(
  playerIds: number[],
  query: {
    pick: 'first' | 'last';
    minDate: Date;
    maxDate: Date;
  }
): Promise<Snapshot[]> {
  if (playerIds.length === 0) {
    return [];
  }

  const rawSnapshots = await prisma.$queryRaw<Snapshot[]>`
    SELECT s.*
    FROM unnest(${playerIds}::int[]) AS p(id)
    CROSS JOIN LATERAL (
      SELECT * FROM public.snapshots
      WHERE "playerId" = p.id AND "createdAt" BETWEEN ${query.minDate} AND ${query.maxDate}
      ORDER BY "createdAt" ${PrismaTypes.raw(query.pick === 'first' ? 'ASC' : 'DESC')}
      LIMIT 1
    ) s
  `;

  // For some reason, the raw query returns dates as strings
  return rawSnapshots.map(s => ({
    ...s,
    overallExperience: Number(s.overallExperience),
    createdAt: new Date(s.createdAt),
    importedAt: s.importedAt ? new Date(s.importedAt) : null
  }));
}
