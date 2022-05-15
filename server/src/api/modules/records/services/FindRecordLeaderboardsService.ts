import { z } from 'zod';
import prisma, {
  Country,
  Record,
  PeriodEnum,
  MetricEnum,
  PlayerTypeEnum,
  PlayerBuildEnum,
  PrismaTypes,
  modifyRecords
} from '../../../../prisma';

const MAX_RESULTS = 20;

const inputSchema = z.object({
  period: z.nativeEnum(PeriodEnum),
  metric: z.nativeEnum(MetricEnum),
  country: z.nativeEnum(Country).optional(),
  playerType: z.nativeEnum(PlayerTypeEnum).optional(),
  playerBuild: z.nativeEnum(PlayerBuildEnum).optional()
});

type FindRecordLeaderboardsParams = z.infer<typeof inputSchema>;

async function findRecordLeaderboards(payload: FindRecordLeaderboardsParams): Promise<Record[]> {
  const params = inputSchema.parse(payload);

  const playerQuery: PrismaTypes.PlayerWhereInput = {};

  if (params.country) playerQuery.country = params.country;
  if (params.playerType) playerQuery.type = params.playerType;
  if (params.playerBuild) playerQuery.build = params.playerBuild;

  // When filtering by player type, the ironman filter should include UIM and HCIM
  if (playerQuery.type === PlayerTypeEnum.IRONMAN) {
    playerQuery.type = { in: [PlayerTypeEnum.IRONMAN, PlayerTypeEnum.HARDCORE, PlayerTypeEnum.ULTIMATE] };
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

  return records;
}

export { findRecordLeaderboards };
