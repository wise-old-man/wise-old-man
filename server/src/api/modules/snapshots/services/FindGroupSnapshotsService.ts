import { z } from 'zod';
import prisma, { PrismaTypes, Snapshot, PrismaSnapshot, modifySnapshots } from '../../../../prisma';
import { NotFoundError } from '../../../errors';

const inputSchema = z
  .object({
    // This can be used on a fully formed group, or just an array of player ids
    groupId: z.number().int().positive().optional(),
    playerIds: z.array(z.number().int().positive()).optional(),

    minDate: z.date().optional(),
    maxDate: z.date().optional(),
    // By default, this service will only get 1 snapshot per player
    // (the first after minDate, or the last before maxDate)
    // Alternatively, we can use this boolean to ask for every snapshot in between the two dates
    includeAllBetween: z.boolean().optional().default(false)
  })
  .refine(s => s.groupId || s.playerIds, {
    message: 'Must provide either group id or player ids array.'
  })
  .refine(s => !s.includeAllBetween || (s.minDate && s.maxDate), {
    message: 'Min and max dates should be valid when using "includeAllBetween=true"'
  });

interface QueryParams {
  sortBy: keyof PrismaTypes.SnapshotOrderByWithRelationInput;
  limit: number;
  offset: number;
}

type FindGroupSnapshotsParams = z.infer<typeof inputSchema>;

async function findGroupSnapshots(
  payload: FindGroupSnapshotsParams,
  queryParams?: QueryParams
): Promise<Snapshot[]> {
  const params = inputSchema.parse(payload);

  // Use the player ids provided in params, or fetch them through the group id.
  const playerIds = await resolvePlayerIds(params);

  if (playerIds.length === 0) {
    return [];
  }

  if (params.includeAllBetween) {
    // Get all snapshots between min and max dates (for each player id)
    const snapshots = await prisma.snapshot
      .findMany({
        where: {
          playerId: { in: playerIds },
          createdAt: { gte: params.minDate, lte: params.maxDate }
        },
        orderBy: { createdAt: 'asc' }
      })
      .then(modifySnapshots);

    return snapshots;
  }

  if (params.minDate) {
    // Get the first snapshot AFTER min date (for each player id)
    return await getFirstSnapshot(playerIds, params.minDate, queryParams);
  }

  if (params.maxDate) {
    // Get the last snapshot BEFORE max date (for each player id)
    return await getLastSnapshot(playerIds, params.maxDate, queryParams);
  }

  return [];
}

async function resolvePlayerIds(params: FindGroupSnapshotsParams): Promise<number[]> {
  if (params.playerIds) {
    return params.playerIds;
  }

  // Fetch this group and all of its memberships
  const groupAndMemberships = await prisma.group.findFirst({
    where: { id: params.groupId },
    include: { memberships: { select: { playerId: true } } }
  });

  if (!groupAndMemberships) {
    throw new NotFoundError('Group not found.');
  }

  // Convert the memberships to an array of player IDs
  return groupAndMemberships.memberships.map(m => m.playerId);
}

/**
 * Gets the last snapshot (before maxDate) for each playerId
 */
async function getLastSnapshot(
  playerIds: number[],
  maxDate: Date,
  queryParams?: QueryParams
): Promise<Snapshot[]> {
  const formattedPlayerIds = PrismaTypes.join(playerIds, ',');
  const formattedColumnName = PrismaTypes.raw(queryParams?.sortBy || 'id');

  const snapshots = await prisma.$queryRaw<PrismaSnapshot[]>`
      SELECT s.*, s."playerId", s."createdAt"
      FROM (SELECT q."playerId", MAX(q."createdAt") AS max_date
            FROM public.snapshots q
            WHERE q."playerId" IN (${formattedPlayerIds}) AND q."createdAt" < ${maxDate}
            GROUP BY q."playerId"
          ) r
      JOIN public.snapshots s
      ON s."playerId" = r."playerId" AND s."createdAt" = r.max_date
      ORDER BY s."${formattedColumnName}" DESC
      LIMIT ${queryParams?.limit ?? 100_000}
      OFFSET ${queryParams?.offset ?? 0}`;

  // For some reason, the raw query returns dates as strings
  const fixedDates = snapshots.map(s => ({
    ...s,
    createdAt: new Date(s.createdAt),
    importedAt: s.importedAt ? new Date(s.importedAt) : null
  }));

  return modifySnapshots(fixedDates);
}

/**
 * Gets the first snapshot (after minDate) for each playerId
 */
async function getFirstSnapshot(
  playerIds: number[],
  minDate: Date,
  queryParams?: QueryParams
): Promise<Snapshot[]> {
  const formattedPlayerIds = PrismaTypes.join(playerIds, ',');
  const formattedColumnName = PrismaTypes.raw(queryParams?.sortBy || 'id');

  const snapshots = await prisma.$queryRaw<PrismaSnapshot[]>`
      SELECT s.*, s."playerId", s."createdAt"
      FROM (SELECT q."playerId", MIN(q."createdAt") AS min_date
            FROM public.snapshots q
            WHERE q."playerId" IN (${formattedPlayerIds}) AND q."createdAt" > ${minDate}
            GROUP BY q."playerId"
          ) r
      JOIN public.snapshots s
          ON s."playerId" = r."playerId" AND s."createdAt" = r.min_date
      ORDER BY s."${formattedColumnName}" DESC
      LIMIT ${queryParams?.limit ?? 100_000}
      OFFSET ${queryParams?.offset ?? 0}`;

  // For some reason, the raw query returns dates as strings
  const fixedDates = snapshots.map(s => ({
    ...s,
    createdAt: new Date(s.createdAt),
    importedAt: s.importedAt ? new Date(s.importedAt) : null
  }));

  return modifySnapshots(fixedDates);
}

export { findGroupSnapshots };
