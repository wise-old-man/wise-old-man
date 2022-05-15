import { z } from 'zod';
import { PeriodProps } from '@wise-old-man/utils';
import prisma, {
  Player,
  Country,
  PeriodEnum,
  MetricEnum,
  PlayerTypeEnum,
  PlayerBuildEnum,
  PrismaTypes,
  modifyDeltas,
  Delta
} from '../../../../prisma';
import { parseNum } from '../delta.utils';

const MAX_RESULTS = 20;

const inputSchema = z.object({
  period: z.nativeEnum(PeriodEnum),
  metric: z.nativeEnum(MetricEnum),
  country: z.nativeEnum(Country).optional(),
  playerType: z.nativeEnum(PlayerTypeEnum).optional(),
  playerBuild: z.nativeEnum(PlayerBuildEnum).optional()
});

type FindDeltaLeaderboardsParams = z.infer<typeof inputSchema>;

type FindDeltaLeaderboardsResult = Array<{
  startDate: Date;
  endDate: Date;
  gained: number;
  player: Player;
}>;

async function findDeltaLeaderboards(
  payload: FindDeltaLeaderboardsParams
): Promise<FindDeltaLeaderboardsResult> {
  const params = inputSchema.parse(payload);

  const playerQuery: PrismaTypes.PlayerWhereInput = {};

  if (params.country) playerQuery.country = params.country;
  if (params.playerType) playerQuery.type = params.playerType;
  if (params.playerBuild) playerQuery.build = params.playerBuild;

  // When filtering by player type, the ironman filter should include UIM and HCIM
  if (playerQuery.type === PlayerTypeEnum.IRONMAN) {
    playerQuery.type = { in: [PlayerTypeEnum.IRONMAN, PlayerTypeEnum.HARDCORE, PlayerTypeEnum.ULTIMATE] };
  }

  // Fetch the top 20 deltas for this period & metric
  const deltas = await prisma.delta
    .findMany({
      where: {
        period: params.period,
        updatedAt: { gte: new Date(Date.now() - PeriodProps[params.period].milliseconds) },
        player: { ...playerQuery }
      },
      select: {
        [params.metric]: true,
        startedAt: true,
        endedAt: true,
        player: true
      },
      orderBy: [{ [params.metric]: 'desc' }],
      take: MAX_RESULTS
    })
    .then(modifyDeltas);

  // Transform the database objects into the tighter result response objects
  const results = deltas.map((d: Delta | any) => ({
    player: d.player,
    startDate: d.startedAt,
    endDate: d.endedAt,
    gained: Math.max(0, parseNum(params.metric, String(d[params.metric])))
  }));

  return results;
}

export { findDeltaLeaderboards };
