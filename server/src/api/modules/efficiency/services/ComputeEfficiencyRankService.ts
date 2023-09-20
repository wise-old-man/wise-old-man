import { z } from 'zod';
import { ComputedMetric, PlayerBuild, PlayerStatus, PlayerType } from '../../../../utils';
import prisma from '../../../../prisma';

const inputSchema = z.object({
  player: z.object({
    id: z.number().int().positive(),
    type: z.nativeEnum(PlayerType),
    build: z.nativeEnum(PlayerBuild)
  }),
  metric: z.nativeEnum(ComputedMetric),
  value: z.number().gte(0)
});

type ComputeEfficiencyRankParams = z.infer<typeof inputSchema>;

async function computeEfficiencyRank(payload: ComputeEfficiencyRankParams): Promise<number> {
  const params = inputSchema.parse(payload);

  const rank = await prisma.player.count({
    where: {
      type: params.player.type,
      build: params.player.build,
      [params.metric]: { gte: params.value }
    }
  });

  // If player is not in the top 50, a quick COUNT(*) query gives an acceptable
  // rank approximation, this however won't work for players in the top of the
  // leaderboards, and we'll have to use their overall rank from the snapshots
  if (rank > 50) return rank;

  const topPlayers = await prisma.player.findMany({
    where: {
      [params.metric]: { gte: params.value },
      type: params.player.type,
      build: params.player.build,
      status: { not: PlayerStatus.ARCHIVED }
    },
    include: {
      latestSnapshot: true
    }
  });

  const smarterRank = topPlayers
    .sort(
      (a, b) =>
        (a.latestSnapshot?.overallRank ?? Number.MAX_SAFE_INTEGER) -
        (b.latestSnapshot?.overallRank ?? Number.MAX_SAFE_INTEGER)
    )
    .findIndex(p => p.id === params.player.id);

  return smarterRank < 0 ? rank + 1 : smarterRank + 1;
}

export { computeEfficiencyRank };
