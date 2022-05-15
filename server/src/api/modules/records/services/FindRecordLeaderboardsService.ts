import { z } from 'zod';
import { COUNTRIES } from '@wise-old-man/utils';
import prisma, {
  Record,
  PeriodEnum,
  MetricEnum,
  PlayerTypeEnum,
  PlayerBuildEnum,
  PrismaTypes,
  modifyRecords
} from '../../../../prisma';

const MAX_RESULTS = 20;

// TODO: improve when "Countries" is refactored into prisma enum
const COUNTRY_CODES = COUNTRIES.map(c => c.code);

const inputSchema = z
  .object({
    period: z.nativeEnum(PeriodEnum),
    metric: z.nativeEnum(MetricEnum),
    playerType: z.nativeEnum(PlayerTypeEnum).optional(),
    playerBuild: z.nativeEnum(PlayerBuildEnum).optional(),
    country: z.string().optional()
  })
  .refine(s => !s.country || COUNTRY_CODES.includes(s.country), {
    message: `Invalid enum value for 'country'. You must either supply a valid country code, according to the ISO 3166-1 standard. \
    Please see: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2`
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
