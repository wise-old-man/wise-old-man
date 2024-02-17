import {
  Period,
  Metric,
  PlayerType,
  PlayerBuild,
  Country,
  DeltaLeaderboardEntry,
  PlayerStatus
} from '../../../../utils';
import prisma, { PrismaTypes } from '../../../../prisma';
import { parseNum } from '../delta.utils';

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
): Promise<DeltaLeaderboardEntry[]> {
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
  const deltas = await prisma.delta.findMany({
    where: {
      period,
      player: { ...playerQuery, status: PlayerStatus.ACTIVE }
    },
    select: {
      [metric]: true,
      playerId: true,
      startedAt: true,
      endedAt: true,
      player: true
    },
    orderBy: [{ [metric]: 'desc' }],
    take: MAX_RESULTS
  });

  // Transform the database objects into the tighter result response objects
  const results = deltas.map(d => ({
    player: d.player,
    playerId: d.playerId,
    startDate: d.startedAt,
    endDate: d.endedAt,
    gained: Math.max(0, parseNum(metric, String(d[metric])))
  }));

  return results;
}

export { findDeltaLeaderboards };
