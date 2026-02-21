import prisma, { PrismaTypes } from '../../../../prisma';
import {
  Country,
  Metric,
  Period,
  Player,
  PlayerAnnotationType,
  PlayerBuild,
  PlayerStatus,
  PlayerType,
  Record
} from '../../../../types';
import { optOutFilter } from '../../../../utils/shared/player-annotation.utils';

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
): Promise<Array<{ record: Record; player: Player }>> {
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
      player: {
        ...playerQuery,
        status: PlayerStatus.ACTIVE,
        ...optOutFilter([PlayerAnnotationType.OPT_OUT, PlayerAnnotationType.OPT_OUT_COMPETITIONS])
      }
    },
    include: { player: true },
    orderBy: [{ value: 'desc' }],
    take: MAX_RESULTS
  });

  return records.map(({ player, ...record }) => ({ player, record }));
}

export { findRecordLeaderboards };
