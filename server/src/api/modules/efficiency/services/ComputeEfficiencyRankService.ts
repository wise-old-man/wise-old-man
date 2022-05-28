import { z } from 'zod';
import { Virtual, PlayerType } from '../../../../utils';
import prisma from '../../../../prisma';

const inputSchema = z.object({
  player: z.object({
    id: z.number().int().positive(),
    type: z.nativeEnum(PlayerType)
  }),
  metric: z.nativeEnum(Virtual),
  value: z.number().gte(0)
});

type ComputeEfficiencyRankParams = z.infer<typeof inputSchema>;

async function computeEfficiencyRank(payload: ComputeEfficiencyRankParams): Promise<number> {
  const params = inputSchema.parse(payload);

  const rank = await prisma.player.count({
    where: {
      id: { not: params.player.id },
      type: params.player.type,
      [params.metric]: { gte: params.value }
    }
  });

  // If player is not in the top 50, a quick COUNT(*) query gives an acceptable
  // rank approximation, this however won't work for players in the top of the
  // leaderboards, and we'll have to use their registration date as a tie breaker
  if (rank > 50) return rank + 1;

  const topPlayers = await prisma.player.findMany({
    where: {
      [params.metric]: { gte: params.value },
      type: params.player.type
    }
  });

  const smarterRank = topPlayers
    .sort(
      (a, b) => b[params.metric] - a[params.metric] || a.registeredAt.getTime() - b.registeredAt.getTime()
    )
    .findIndex(p => p.id === params.player.id);

  return smarterRank < 0 ? rank + 1 : smarterRank + 1;
}

export { computeEfficiencyRank };
