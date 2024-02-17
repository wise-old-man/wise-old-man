import prisma, { Player, PrismaTypes } from '../../../../prisma';
import { ComputedMetric, Country, Metric, PlayerBuild, PlayerStatus, PlayerType } from '../../../../utils';
import { omit } from '../../../util/objects';
import { PaginationOptions } from '../../../util/validation';

const COMBINED_METRIC = 'ehp+ehb';

type Filter = {
  country?: Country;
  playerType?: PlayerType;
  playerBuild?: PlayerBuild;
};

async function findEfficiencyLeaderboards(
  metric: ComputedMetric | typeof COMBINED_METRIC,
  filter: Filter,
  pagination: PaginationOptions
): Promise<Player[]> {
  const { playerBuild } = filter;
  const { limit, offset } = pagination;

  // For EHP categories with multiple players with 200m all, we can't just sort by EHP,
  // we need to find a tie breaker, for this, we'll pull snapshots and use their overall rank
  const requiresSorting = offset < 50 && metric === Metric.EHP && playerBuild === PlayerBuild.MAIN;

  if (requiresSorting) {
    // Fetch top 100 players, and include their snapshots
    const sortedPlayers = (await fetchSortedPlayersList(metric, filter)).sort(
      (a, b) =>
        (a.latestSnapshot?.overallRank ?? Number.MAX_SAFE_INTEGER) -
        (b.latestSnapshot?.overallRank ?? Number.MAX_SAFE_INTEGER)
    );

    // Once we've used their snapshots to sort by rank, we can omit them from the response
    return sortedPlayers.map(s => omit(s, 'latestSnapshot')).slice(offset, offset + limit);
  }

  return await fetchPlayersList(metric, filter, pagination);
}

async function fetchSortedPlayersList(metric: ComputedMetric | typeof COMBINED_METRIC, filter: Filter) {
  const { country, playerType, playerBuild } = filter;

  const playerQuery: PrismaTypes.PlayerWhereInput = {
    type: playerType,
    build: playerBuild,
    status: PlayerStatus.ACTIVE
  };

  // When filtering by player type, the ironman filter should include UIM and HCIM
  if (playerQuery.type === PlayerType.IRONMAN) {
    playerQuery.type = { in: [PlayerType.IRONMAN, PlayerType.HARDCORE, PlayerType.ULTIMATE] };
  }

  if (country) playerQuery.country = country;

  const players = await prisma.player.findMany({
    where: { ...playerQuery },
    orderBy: { [metric]: 'desc' },
    take: 100,
    skip: 0,
    include: {
      latestSnapshot: true
    }
  });

  return players;
}

async function fetchPlayersList(
  metric: ComputedMetric | typeof COMBINED_METRIC,
  filter: Filter,
  pagination: PaginationOptions
) {
  const { country, playerType, playerBuild } = filter;
  const { limit, offset } = pagination;

  if (metric !== COMBINED_METRIC) {
    const playerQuery: PrismaTypes.PlayerWhereInput = {
      type: playerType,
      build: playerBuild,
      status: { not: PlayerStatus.ARCHIVED }
    };

    // When filtering by player type, the ironman filter should include UIM and HCIM
    if (playerQuery.type === PlayerType.IRONMAN) {
      playerQuery.type = { in: [PlayerType.IRONMAN, PlayerType.HARDCORE, PlayerType.ULTIMATE] };
    }

    if (country) playerQuery.country = country;

    const players = await prisma.player.findMany({
      where: { ...playerQuery },
      orderBy: { [metric]: 'desc' },
      take: limit,
      skip: offset
    });

    return players;
  }

  // When filtering by player type, the ironman filter should include UIM and HCIM
  let playerQuery =
    playerType !== PlayerType.IRONMAN
      ? `"type" = '${playerType}'`
      : `("type" = '${PlayerType.IRONMAN}' OR "type" = '${PlayerType.HARDCORE}' OR "type" = '${PlayerType.ULTIMATE}')`;

  if (country) playerQuery += ` AND "country" = '${country}'`;
  if (playerBuild) playerQuery += ` AND "build" = '${playerBuild}'`;

  // For combined metrics, we need to do raw db queries to be able to sort by combined columns
  const players = await prisma.$queryRawUnsafe<Player[]>(`
    SELECT *, (ehp + ehb) AS "ehp+ehb"
    FROM public.players
    WHERE ${playerQuery}
    ORDER BY "ehp+ehb" DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `);

  return players
    .map(p => ({
      ...p,
      exp: Number(p.exp),
      registeredAt: new Date(p.registeredAt),
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : null,
      lastChangedAt: p.lastChangedAt ? new Date(p.lastChangedAt) : null,
      lastImportedAt: p.lastImportedAt ? new Date(p.lastImportedAt) : null
    }))
    .filter(p => p.status !== PlayerStatus.ARCHIVED);
}

export { findEfficiencyLeaderboards };
