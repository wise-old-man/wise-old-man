import { z } from 'zod';
import {
  ComputedMetric,
  PLAYER_BUILDS,
  PLAYER_TYPES,
  PlayerBuild,
  PlayerStatus,
  PlayerType
} from '../../../../utils';
import redisService from '../../../services/external/redis.service';
import prisma from '../../../../prisma';
import { RANK_RESOLUTION } from '../../../jobs/instances/CalculateComputedMetricRankTablesJob';
import { getAlgorithmType } from '../efficiency.utils';

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

  const softEstimate = await calculateSoftEstimate(params);

  // If the player is not in the top 500, we can use the soft estimate as it's
  // a good approximation and it's much faster (100x) than the hard estimate
  if (softEstimate && softEstimate > 500) {
    return softEstimate;
  }

  const hardEstimate = await calculateHardEstimate(params);

  // If player is not in the top 50, a quick COUNT(*) query gives an acceptable
  // rank approximation, this however won't work for players in the top of the
  // leaderboards, and we'll have to use their overall rank from the snapshots
  if (hardEstimate > 50) return hardEstimate;

  return calculateExactRank(params, hardEstimate);
}

async function calculateSoftEstimate(params: ComputeEfficiencyRankParams) {
  const algorithmType = getAlgorithmType({
    type: params.player.type,
    build: params.player.build
  });

  const rankTable = await redisService
    .getValue(`${params.metric}_rank_table`, algorithmType)
    .then(res => (res ? (JSON.parse(res) as Record<number, number>) : null));

  if (!rankTable) {
    return 0;
  }

  const flooredValue = Math.floor(params.value / RANK_RESOLUTION) * RANK_RESOLUTION;
  const ceiledValue = Math.ceil(params.value / RANK_RESOLUTION) * RANK_RESOLUTION;

  const flooredRank = rankTable[flooredValue];
  const ceiledRank = rankTable[ceiledValue];

  if (!ceiledRank || (ceiledValue === 0 && flooredValue === 0)) {
    return flooredRank;
  }

  const ratio = (params.value - flooredValue) / (ceiledValue - flooredValue);

  return Math.floor(flooredRank + (ceiledRank - flooredRank) * ratio);
}

async function calculateHardEstimate(params: ComputeEfficiencyRankParams) {
  // Figure out all combinatiosn of player types and builds that match this player's algorithm.
  // For example, regular 1def pures should be compared to mains, 10hp, zerkers, etc,
  // because they all share the same EHP/EHB rates
  const matches = getTypeAndBuildMatches(params);

  return await prisma.player.count({
    where: {
      OR: matches,
      [params.metric]: { gte: params.value }
    }
  });
}

async function calculateExactRank(params: ComputeEfficiencyRankParams, estimate: number) {
  // Figure out all combinatiosn of player types and builds that match this player's algorithm.
  // For example: regular 1def pures should be compared to mains, 10hp, zerkers, etc,
  // because they all share the same EHP/EHB rates
  const matches = getTypeAndBuildMatches(params);

  const topPlayers = await prisma.player.findMany({
    where: {
      OR: matches,
      [params.metric]: { gte: params.value },
      status: { not: PlayerStatus.ARCHIVED }
    },
    include: {
      latestSnapshot: true
    }
  });

  // Sort by the efficiency metric, and tie-break with overall rank
  const smarterRank = topPlayers
    .sort((a, b) => {
      return (
        (b[params.metric] ?? 0) - (a[params.metric] ?? 0) ||
        (a.latestSnapshot?.overallRank ?? Number.MAX_SAFE_INTEGER) -
          (b.latestSnapshot?.overallRank ?? Number.MAX_SAFE_INTEGER)
      );
    })
    .findIndex(p => p.id === params.player.id);

  return smarterRank < 0 ? estimate + 1 : smarterRank + 1;
}

function getTypeAndBuildMatches(params: ComputeEfficiencyRankParams) {
  const algorithmType = getAlgorithmType({
    type: params.player.type,
    build: params.player.build
  });

  const matches = [];

  PLAYER_TYPES.forEach(type => {
    if (type === PlayerType.UNKNOWN) return;

    PLAYER_BUILDS.forEach(build => {
      if (algorithmType === getAlgorithmType({ type, build })) {
        matches.push({ type, build });
      }
    });
  });

  return matches;
}

export { computeEfficiencyRank };
