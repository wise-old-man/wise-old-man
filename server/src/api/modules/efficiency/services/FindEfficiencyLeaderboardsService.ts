import { z } from 'zod';
import { PlayerBuild, COUNTRIES, PlayerType } from '@wise-old-man/utils';
import prisma, {
  MetricEnum,
  modifyPlayers,
  Player,
  PlayerTypeEnum,
  PrismaPlayer,
  PrismaTypes,
  VirtualEnum
} from '../../../../prisma';
import { PAGINATION_SCHEMA } from '../../../util/validation';

const COMBINED_METRIC = 'ehp+ehb';

// TODO: improve when "Countries" is refactored into prisma enum
const COUNTRY_CODES = COUNTRIES.map(c => c.code);

const inputSchema = z
  .object({
    metric: z.enum([VirtualEnum.EHP, VirtualEnum.EHB, COMBINED_METRIC]),
    playerType: z.nativeEnum(PlayerTypeEnum).optional().default(PlayerTypeEnum.REGULAR),
    playerBuild: z.nativeEnum(PlayerBuild).optional(),
    country: z.string().optional()
  })
  .merge(PAGINATION_SCHEMA)
  .refine(s => !s.country || COUNTRY_CODES.includes(s.country), {
    message: `Invalid enum value for 'country'. You must either supply a valid country code, according to the ISO 3166-1 standard. \
    Please see: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2`
  });

type FindEfficiencyLeaderboardsParams = z.infer<typeof inputSchema>;

async function findEfficiencyLeaderboards(payload: FindEfficiencyLeaderboardsParams): Promise<Player[]> {
  const params = inputSchema.parse(payload);

  const players = await fetchPlayersList(params);

  if (
    params.offset < 50 &&
    params.metric === MetricEnum.EHP &&
    params.playerType === PlayerTypeEnum.REGULAR
  ) {
    // This is a bit of an hack, to make sure the max ehp accounts always
    // retain their maxing order, manually set their registration dates to
    // ascend and use that to order them.
    return players.sort((a, b) => {
      return b.ehp - a.ehp || a.registeredAt.getTime() - b.registeredAt.getTime();
    });
  }

  return players;
}

async function fetchPlayersList(params: FindEfficiencyLeaderboardsParams) {
  if (params.metric !== COMBINED_METRIC) {
    const playerQuery: PrismaTypes.PlayerWhereInput = {
      type: params.playerType
    };

    // When filtering by player type, the ironman filter should include UIM and HCIM
    if (playerQuery.type === PlayerTypeEnum.IRONMAN) {
      playerQuery.type = { in: [PlayerTypeEnum.IRONMAN, PlayerTypeEnum.HARDCORE, PlayerTypeEnum.ULTIMATE] };
    }

    if (params.country) playerQuery.country = params.country;
    if (params.playerBuild) playerQuery.build = params.playerBuild;

    const players = await prisma.player
      .findMany({
        where: { ...playerQuery },
        orderBy: { [params.metric]: 'desc' },
        take: params.limit,
        skip: params.offset
      })
      .then(modifyPlayers);

    return players;
  }

  // When filtering by player type, the ironman filter should include UIM and HCIM
  let playerQuery =
    params.playerType !== PlayerType.IRONMAN
      ? `"type" = '${params.playerType}'`
      : `("type" = '${PlayerTypeEnum.IRONMAN}' OR "type" = '${PlayerTypeEnum.HARDCORE}' OR "type" = '${PlayerTypeEnum.ULTIMATE}')`;

  if (params.country) playerQuery += ` AND "country" = '${params.country}'`;
  if (params.playerBuild) playerQuery += ` AND "build" = '${params.playerBuild}'`;

  // For combined metrics, we need to do raw db queries to be able to sort by combined columns
  const players = await prisma.$queryRawUnsafe<PrismaPlayer[]>(`
    SELECT *, (ehp + ehb) AS "ehp+ehb"
    FROM public.players
    WHERE ${playerQuery}
    ORDER BY "ehp+ehb" DESC
    LIMIT ${params.limit}
    OFFSET ${params.offset}
  `);

  const fixedPlayers = players.map(p => ({
    ...p,
    registeredAt: new Date(p.registeredAt),
    updatedAt: new Date(p.updatedAt),
    lastChangedAt: p.lastChangedAt ? new Date(p.lastChangedAt) : null,
    lastImportedAt: p.lastImportedAt ? new Date(p.lastImportedAt) : null
  }));

  return modifyPlayers(fixedPlayers);
}

export { findEfficiencyLeaderboards };
