import { z } from 'zod';
import { PlayerBuild, COUNTRIES, PeriodProps } from '@wise-old-man/utils';
import prisma, {
  Player,
  PeriodEnum,
  MetricEnum,
  PlayerTypeEnum,
  PrismaTypes,
  modifyDeltas,
  Delta
} from '../../../../prisma';
import { parseNum } from '../delta.utils';

const MAX_RESULTS = 20;

// TODO: improve when "Countries" is refactored into prisma enum
const COUNTRY_CODES = COUNTRIES.map(c => c.code);

const inputSchema = z
  .object({
    period: z.nativeEnum(PeriodEnum),
    metric: z.nativeEnum(MetricEnum),
    playerType: z.nativeEnum(PlayerTypeEnum).optional(),
    playerBuild: z.nativeEnum(PlayerBuild).optional(),
    country: z.string().optional()
  })
  .refine(s => !s.country || COUNTRY_CODES.includes(s.country), {
    message: `Invalid enum value for 'country'. You must either supply a valid country code, according to the ISO 3166-1 standard. \
    Please see: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2`
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
