import { z } from 'zod';
import { Period, Metric, PlayerType, PlayerBuild, Country, DeltaLeaderboardEntry } from '../../../../utils';
import prisma, { PrismaTypes } from '../../../../prisma';
import { parseNum } from '../delta.utils';

const MAX_RESULTS = 20;

const inputSchema = z.object({
  period: z.nativeEnum(Period),
  metric: z.nativeEnum(Metric),
  country: z.nativeEnum(Country).optional(),
  playerType: z.nativeEnum(PlayerType).optional(),
  playerBuild: z.nativeEnum(PlayerBuild).optional()
});

type FindDeltaLeaderboardsParams = z.infer<typeof inputSchema>;

async function findDeltaLeaderboards(payload: FindDeltaLeaderboardsParams): Promise<DeltaLeaderboardEntry[]> {
  const params = inputSchema.parse(payload);

  const playerQuery: PrismaTypes.PlayerWhereInput = {};

  if (params.country) playerQuery.country = params.country;
  if (params.playerType) playerQuery.type = params.playerType;
  if (params.playerBuild) playerQuery.build = params.playerBuild;

  // When filtering by player type, the ironman filter should include UIM and HCIM
  if (playerQuery.type === PlayerType.IRONMAN) {
    playerQuery.type = { in: [PlayerType.IRONMAN, PlayerType.HARDCORE, PlayerType.ULTIMATE] };
  }

  // Fetch the top 20 deltas for this period & metric
  const deltas = await prisma.delta.findMany({
    where: {
      period: params.period,
      player: { ...playerQuery }
    },
    select: {
      [params.metric]: true,
      playerId: true,
      startedAt: true,
      endedAt: true,
      player: true
    },
    orderBy: [{ [params.metric]: 'desc' }],
    take: MAX_RESULTS
  });

  // Transform the database objects into the tighter result response objects
  const results = deltas.map(d => ({
    player: d.player,
    playerId: d.playerId,
    startDate: d.startedAt,
    endDate: d.endedAt,
    gained: Math.max(0, parseNum(params.metric, String(d[params.metric])))
  }));

  return results;
}

export { findDeltaLeaderboards };
