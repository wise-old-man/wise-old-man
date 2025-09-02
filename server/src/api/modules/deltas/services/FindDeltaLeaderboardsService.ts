import prisma, { PrismaTypes } from '../../../../prisma';
import { Country, Metric, Period, Player, PlayerBuild, PlayerStatus, PlayerType } from '../../../../types';

const MAX_RESULTS = 20;

type Filter = {
  country?: Country;
  playerType?: PlayerType;
  playerBuild?: PlayerBuild;
};

async function findDeltaLeaderboards(
  period: Period,
  metric: Metric,
  filter: Filter
): Promise<
  Array<{
    player: Player;
    startDate: Date;
    endDate: Date;
    gained: number;
  }>
> {
  const { country, playerType, playerBuild } = filter;

  const playerQuery: PrismaTypes.PlayerWhereInput = {};

  if (country) playerQuery.country = country;
  if (playerType) playerQuery.type = playerType;
  if (playerBuild) playerQuery.build = playerBuild;

  // When filtering by player type, the ironman filter should include UIM and HCIM
  if (playerQuery.type === PlayerType.IRONMAN) {
    playerQuery.type = { in: [PlayerType.IRONMAN, PlayerType.HARDCORE, PlayerType.ULTIMATE] };
  }

  // Fetch the top 20 deltas for this period & metric
  const deltas = await prisma.cachedDelta.findMany({
    where: {
      period,
      metric,
      player: {
        ...playerQuery,
        status: PlayerStatus.ACTIVE
      }
    },
    select: {
      playerId: true,
      metric: true,
      value: true,
      startedAt: true,
      endedAt: true,
      player: true
    },
    orderBy: [{ value: 'desc' }, { updatedAt: 'asc' }],
    take: MAX_RESULTS
  });

  // Transform the database objects into the tighter result response objects
  const results = deltas.map(d => ({
    player: d.player,
    playerId: d.playerId,
    startDate: d.startedAt,
    endDate: d.endedAt,
    gained: Math.max(0, d.value)
  }));

  return results;
}

export { findDeltaLeaderboards };
