import { z } from 'zod';
import { PlayerBuild, Period, Metric, Country } from '../../../../utils';
import prisma, { PrismaTypes } from '../../../../prisma';
import { RecordLeaderboardEntry } from '../record.types';

const MAX_RESULTS = 20;

const inputSchema = z.object({
  period: z.nativeEnum(Period),
  metric: z.nativeEnum(Metric),
  country: z.nativeEnum(Country).optional(),
  playerBuild: z.nativeEnum(PlayerBuild).optional()
});

type FindRecordLeaderboardsParams = z.infer<typeof inputSchema>;

async function findRecordLeaderboards(
  payload: FindRecordLeaderboardsParams
): Promise<RecordLeaderboardEntry[]> {
  const params = inputSchema.parse(payload);

  const playerQuery: PrismaTypes.PlayerWhereInput = {};

  if (params.country) playerQuery.country = params.country;
  if (params.playerBuild) playerQuery.build = params.playerBuild;

  const records = await prisma.record.findMany({
    where: {
      metric: params.metric,
      period: params.period,
      player: { ...playerQuery }
    },
    include: { player: true },
    orderBy: [{ value: 'desc' }],
    take: MAX_RESULTS
  });

  return records;
}

export { findRecordLeaderboards };
