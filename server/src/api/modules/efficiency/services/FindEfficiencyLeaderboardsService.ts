import { z } from 'zod';
import prisma, { Player, PrismaTypes } from '../../../../prisma';
import { PlayerType, PlayerBuild, Metric, Country, PlayerStatus } from '../../../../utils';
import { omit } from '../../../util/objects';
import { PAGINATION_SCHEMA } from '../../../util/validation';

const COMBINED_METRIC = 'ehp+ehb';

const inputSchema = z
  .object({
    metric: z.enum([Metric.EHP, Metric.EHB, COMBINED_METRIC]),
    country: z.nativeEnum(Country).optional(),
    playerType: z.nativeEnum(PlayerType).optional().default(PlayerType.REGULAR),
    playerBuild: z.nativeEnum(PlayerBuild).optional().default(PlayerBuild.MAIN)
  })
  .merge(PAGINATION_SCHEMA);

type FindEfficiencyLeaderboardsParams = z.infer<typeof inputSchema>;

async function findEfficiencyLeaderboards(payload: FindEfficiencyLeaderboardsParams): Promise<Player[]> {
  const params = inputSchema.parse(payload);

  // For EHP categories with multiple players with 200m all, we can't just sort by EHP,
  // we need to find a tie breaker, for this, we'll pull snapshots and use their overall rank
  const requiresSorting =
    params.offset < 50 && params.metric === Metric.EHP && params.playerBuild === PlayerBuild.MAIN;

  if (requiresSorting) {
    // Fetch top 50 players, and include their snapshots
    const sortedPlayers = (await fetchSortedPlayersList({ ...params, limit: 50 })).sort(
      (a, b) =>
        (a.latestSnapshot?.overallRank ?? Number.MAX_SAFE_INTEGER) -
        (b.latestSnapshot?.overallRank ?? Number.MAX_SAFE_INTEGER)
    );

    // Once we've used their snapshots to sort by rank, we can omit them from the response
    return sortedPlayers.map(s => omit(s, 'latestSnapshot')).slice(0, params.limit);
  }

  return await fetchPlayersList(params);
}

async function fetchSortedPlayersList(params: FindEfficiencyLeaderboardsParams) {
  const playerQuery: PrismaTypes.PlayerWhereInput = {
    type: params.playerType,
    build: params.playerBuild,
    status: { not: PlayerStatus.ARCHIVED }
  };

  // When filtering by player type, the ironman filter should include UIM and HCIM
  if (playerQuery.type === PlayerType.IRONMAN) {
    playerQuery.type = { in: [PlayerType.IRONMAN, PlayerType.HARDCORE, PlayerType.ULTIMATE] };
  }

  if (params.country) playerQuery.country = params.country;

  const players = await prisma.player.findMany({
    where: { ...playerQuery },
    orderBy: { [params.metric]: 'desc' },
    take: params.limit,
    skip: params.offset,
    include: {
      latestSnapshot: true
    }
  });

  return players;
}

async function fetchPlayersList(params: FindEfficiencyLeaderboardsParams) {
  if (params.metric !== COMBINED_METRIC) {
    const playerQuery: PrismaTypes.PlayerWhereInput = {
      type: params.playerType,
      build: params.playerBuild,
      status: { not: PlayerStatus.ARCHIVED }
    };

    // When filtering by player type, the ironman filter should include UIM and HCIM
    if (playerQuery.type === PlayerType.IRONMAN) {
      playerQuery.type = { in: [PlayerType.IRONMAN, PlayerType.HARDCORE, PlayerType.ULTIMATE] };
    }

    if (params.country) playerQuery.country = params.country;

    const players = await prisma.player.findMany({
      where: { ...playerQuery },
      orderBy: { [params.metric]: 'desc' },
      take: params.limit,
      skip: params.offset
    });

    return players;
  }

  // When filtering by player type, the ironman filter should include UIM and HCIM
  let playerQuery =
    params.playerType !== PlayerType.IRONMAN
      ? `"type" = '${params.playerType}'`
      : `("type" = '${PlayerType.IRONMAN}' OR "type" = '${PlayerType.HARDCORE}' OR "type" = '${PlayerType.ULTIMATE}')`;

  if (params.country) playerQuery += ` AND "country" = '${params.country}'`;
  if (params.playerBuild) playerQuery += ` AND "build" = '${params.playerBuild}'`;

  // For combined metrics, we need to do raw db queries to be able to sort by combined columns
  const players = await prisma.$queryRawUnsafe<Player[]>(`
    SELECT *, (ehp + ehb) AS "ehp+ehb"
    FROM public.players
    WHERE ${playerQuery}
    ORDER BY "ehp+ehb" DESC
    LIMIT ${params.limit}
    OFFSET ${params.offset}
  `);

  return players
    .map(p => ({
      ...p,
      exp: Number(p.exp),
      registeredAt: new Date(p.registeredAt),
      updatedAt: new Date(p.updatedAt),
      lastChangedAt: p.lastChangedAt ? new Date(p.lastChangedAt) : null,
      lastImportedAt: p.lastImportedAt ? new Date(p.lastImportedAt) : null
    }))
    .filter(p => p.status !== PlayerStatus.ARCHIVED);
}

export { findEfficiencyLeaderboards };
