import { PlayerType, PlayerStatus, Period, Metric, Country, PlayerBuild } from '../../../../utils';
import prisma, { PrismaTypes } from '../../../../prisma';
import { RecordLeaderboardEntry } from '../record.types';

const MAX_RESULTS = 20;

type Filter = {
  country?: Country;
  playerType?: PlayerType;
  playerBuild?: PlayerBuild;
};

async function findRecordLeaderboards(
  period: Period,
  metric: Metric,
  filter: Filter
): Promise<RecordLeaderboardEntry[]> {
  const { country, playerType, playerBuild } = filter;

  const playerQuery: PrismaTypes.PlayerWhereInput = {};

  if (country) playerQuery.country = country;
  if (playerType) playerQuery.type = playerType;
  if (playerBuild) playerQuery.build = playerBuild;

  // When filtering by player type, the ironman filter should include UIM and HCIM
  if (playerQuery.type === PlayerType.IRONMAN) {
    playerQuery.type = { in: [PlayerType.IRONMAN, PlayerType.HARDCORE, PlayerType.ULTIMATE] };
  }

  const records = await prisma.record.findMany({
    where: {
      metric,
      period,
      player: { ...playerQuery, status: PlayerStatus.ACTIVE }
    },
    include: { player: true },
    orderBy: [{ value: 'desc' }],
    take: MAX_RESULTS
  });

  return records;
}

export { findRecordLeaderboards };
