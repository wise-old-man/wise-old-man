import { z } from 'zod';
import { PlayerType, PlayerBuild, Period, Metric, Country } from '../../../../utils';
import prisma, { PrismaTypes, modifyRecords } from '../../../../prisma';
import { RecordLeaderboardEntry } from '../record.types';

const MAX_RESULTS = 20;

const inputSchema = z.object({
  period: z.nativeEnum(Period),
  metric: z.nativeEnum(Metric),
  country: z.nativeEnum(Country).optional(),
  playerType: z.nativeEnum(PlayerType).optional(),
  playerBuild: z.nativeEnum(PlayerBuild).optional()
});

type FindRecordLeaderboardsParams = z.infer<typeof inputSchema>;

async function findRecordLeaderboards(
  payload: FindRecordLeaderboardsParams
): Promise<RecordLeaderboardEntry[]> {
  const params = inputSchema.parse(payload);

  const playerQuery: PrismaTypes.PlayerWhereInput = {};

  if (params.country) playerQuery.country = params.country;
  if (params.playerType) playerQuery.type = params.playerType;
  if (params.playerBuild) playerQuery.build = params.playerBuild;

  // When filtering by player type, the ironman filter should include UIM and HCIM
  if (playerQuery.type === PlayerType.IRONMAN) {
    playerQuery.type = { in: [PlayerType.IRONMAN, PlayerType.HARDCORE, PlayerType.ULTIMATE] };
  }

  const records = await prisma.record
    .findMany({
      where: {
        metric: params.metric,
        period: params.period,
        player: { ...playerQuery }
      },
      include: { player: true },
      orderBy: [{ value: 'desc' }],
      take: MAX_RESULTS
    })
    .then(modifyRecords);

  return records as RecordLeaderboardEntry[];
}

export { findRecordLeaderboards };
