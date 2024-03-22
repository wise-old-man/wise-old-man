import { RANK_RESOLUTION } from '../../../../jobs/instances/CalculateComputedMetricRankTablesJob';
import prisma from '../../../../prisma';
import {
  ComputedMetric,
  PLAYER_BUILDS,
  PLAYER_TYPES,
  Player,
  PlayerBuild,
  PlayerStatus,
  PlayerType
} from '../../../../utils';
import redisService from '../../../services/external/redis.service';
import { getAlgorithmType } from '../efficiency.utils';

async function computeEfficiencyRank(
  player: Pick<Player, 'id' | 'type' | 'build'>,
  metric: ComputedMetric,
  value: number
): Promise<number> {
  const softEstimate = await calculateSoftEstimate(player, metric, value);

  // If the player is not in the top 500, we can use the soft estimate as it's
  // a good approximation and it's much faster (100x) than the hard estimate
  if (softEstimate && softEstimate > 500) {
    return softEstimate;
  }

  const hardEstimate = await calculateHardEstimate(player, metric, value);

  // If player is not in the top 50, a quick COUNT(*) query gives an acceptable
  // rank approximation, this however won't work for players in the top of the
  // leaderboards, and we'll have to use their overall rank from the snapshots
  if (hardEstimate > 50) return hardEstimate;

  return calculateExactRank(player, metric, value, hardEstimate);
}

async function calculateSoftEstimate(
  player: Pick<Player, 'id' | 'type' | 'build'>,
  metric: ComputedMetric,
  value: number
) {
  const algorithmType = getAlgorithmType({
    type: player.type,
    build: player.build
  });

  const rankTable = await redisService
    .getValue(`${metric}_rank_table`, algorithmType)
    .then(res => (res ? (JSON.parse(res) as Record<number, number>) : null));

  if (!rankTable) {
    return 0;
  }

  const flooredValue = Math.floor(value / RANK_RESOLUTION) * RANK_RESOLUTION;
  const ceiledValue = Math.ceil(value / RANK_RESOLUTION) * RANK_RESOLUTION;

  const flooredRank = rankTable[flooredValue];
  const ceiledRank = rankTable[ceiledValue];

  if (!ceiledRank || (ceiledValue === 0 && flooredValue === 0)) {
    return flooredRank;
  }

  const ratio = (value - flooredValue) / (ceiledValue - flooredValue);

  return Math.floor(flooredRank + (ceiledRank - flooredRank) * ratio);
}

async function calculateHardEstimate(
  player: Pick<Player, 'id' | 'type' | 'build'>,
  metric: ComputedMetric,
  value: number
) {
  // Figure out all combinatiosn of player types and builds that match this player's algorithm.
  // For example, regular 1def pures should be compared to mains, 10hp, zerkers, etc,
  // because they all share the same EHP/EHB rates
  const matches = getTypeAndBuildMatches(player);

  return await prisma.player.count({
    where: {
      OR: matches,
      [metric]: { gte: value }
    }
  });
}

async function calculateExactRank(
  player: Pick<Player, 'id' | 'type' | 'build'>,
  metric: ComputedMetric,
  value: number,
  estimate: number
) {
  // Figure out all combinatiosn of player types and builds that match this player's algorithm.
  // For example: regular 1def pures should be compared to mains, 10hp, zerkers, etc,
  // because they all share the same EHP/EHB rates
  const matches = getTypeAndBuildMatches(player);

  const topPlayers = await prisma.player.findMany({
    where: {
      OR: matches,
      [metric]: { gte: value },
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
        (b[metric] ?? 0) - (a[metric] ?? 0) ||
        (a.latestSnapshot?.overallRank ?? Number.MAX_SAFE_INTEGER) -
          (b.latestSnapshot?.overallRank ?? Number.MAX_SAFE_INTEGER)
      );
    })
    .findIndex(p => p.id === player.id);

  return smarterRank < 0 ? estimate + 1 : smarterRank + 1;
}

function getTypeAndBuildMatches(player: Pick<Player, 'id' | 'type' | 'build'>) {
  const algorithmType = getAlgorithmType({
    type: player.type,
    build: player.build
  });

  const matches: Array<{ type: PlayerType; build: PlayerBuild }> = [];

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
