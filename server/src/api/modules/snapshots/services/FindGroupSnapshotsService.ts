import prisma, { PrismaTypes } from '../../../../prisma';
import { Snapshot } from '../../../../types';

export async function findGroupSnapshots(
  playerIds: number[],
  query: {
    pick: 'first' | 'last';
    select?: Array<keyof Snapshot>;
    minDate: Date;
    maxDate: Date;
  }
): Promise<Snapshot[]> {
  if (playerIds.length === 0) {
    return [];
  }

  const columns = buildColumnList(query.select);

  const rawSnapshots = await prisma.$queryRaw<Snapshot[]>`
    SELECT s.*
    FROM unnest(${playerIds}::int[]) AS p(id)
    CROSS JOIN LATERAL (
      SELECT ${columns} FROM public.snapshots
      WHERE "playerId" = p.id AND "createdAt" BETWEEN ${query.minDate} AND ${query.maxDate}
      ORDER BY "createdAt" ${PrismaTypes.raw(query.pick === 'first' ? 'ASC' : 'DESC')}
      LIMIT 1
    ) s
  `;

  // For some reason, the raw query returns dates as strings
  return rawSnapshots.map(snapshot => ({
    ...snapshot,
    ...('overallExperience' in snapshot && {
      overallExperience: Number(snapshot.overallExperience)
    }),
    ...('importedAt' in snapshot && {
      importedAt: snapshot.importedAt ? new Date(snapshot.importedAt) : null
    }),
    createdAt: new Date(snapshot.createdAt)
  }));
}

function buildColumnList(select: Array<keyof Snapshot> | undefined) {
  if (select === undefined) {
    return PrismaTypes.raw('*');
  }

  // Ensure these primary keys are always included in the query, even if not explicitly requested
  const columns = new Set<keyof Snapshot>(['playerId', 'createdAt', ...select]);

  return PrismaTypes.raw(Array.from(columns, column => `"${column}"`).join(', '));
}
