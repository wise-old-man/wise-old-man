import { z } from 'zod';
import prisma, { modifyPlayer, Player, PrismaPlayer, PrismaTypes } from '../../../../prisma';
import { PlayerType, PlayerBuild, Metric, Country, PlayerStatus } from '../../../../utils';
import { PAGINATION_SCHEMA } from '../../../util/validation';

const COMBINED_METRIC = 'ehp+ehb';

const inputSchema = z
  .object({
    metric: z.enum([Metric.EHP, Metric.EHB, COMBINED_METRIC]),
    country: z.nativeEnum(Country).optional(),
    playerType: z.nativeEnum(PlayerType).optional().default(PlayerType.REGULAR),
    playerBuild: z.nativeEnum(PlayerBuild).optional()
  })
  .merge(PAGINATION_SCHEMA);

type FindEfficiencyLeaderboardsParams = z.infer<typeof inputSchema>;

async function findEfficiencyLeaderboards(payload: FindEfficiencyLeaderboardsParams): Promise<Player[]> {
  const params = inputSchema.parse(payload);

  const players = await fetchPlayersList(params);

  if (params.offset < 50 && params.metric === Metric.EHP && params.playerType === PlayerType.REGULAR) {
    // This is a bit of an hack, to make sure the max ehp accounts always
    // retain their maxing order, manually set their registration dates to
    // ascend and use that to order them.
    return players
      .filter(player => player.status !== PlayerStatus.ARCHIVED)
      .sort((a, b) => {
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
    if (playerQuery.type === PlayerType.IRONMAN) {
      playerQuery.type = { in: [PlayerType.IRONMAN, PlayerType.HARDCORE, PlayerType.ULTIMATE] };
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
      .then(p => p.map(modifyPlayer));

    return players;
  }

  // When filtering by player type, the ironman filter should include UIM and HCIM
  let playerQuery =
    params.playerType !== PlayerType.IRONMAN
      ? `"type" = '${params.playerType}'`
      : `("type" = '${PlayerType.IRONMAN}' OR "type" = '${PlayerType.HARDCORE}' OR "type" = '${PlayerType.ULTIMATE}')`;

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

  return fixedPlayers.map(modifyPlayer);
}

export { findEfficiencyLeaderboards };
