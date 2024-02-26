import { Snapshot } from '../../../../prisma';
import { Metric, Player } from '../../../../utils';
import { getAlgorithm, getExperienceMap, getKillcountMap } from '../efficiency.utils';
import { computeEfficiencyRank } from './ComputeEfficiencyRankService';

interface ComputePlayerMetricsResult {
  ttm: number;
  tt200m: number;
  ehpValue: number;
  ehpRank: number;
  ehbValue: number;
  ehbRank: number;
}

async function computePlayerMetrics(player: Pick<Player, 'id' | 'type' | 'build'>, snapshot: Snapshot) {
  const killcountMap = getKillcountMap(snapshot);
  const experienceMap = getExperienceMap(snapshot);

  const algorithm = getAlgorithm({ type: player.type, build: player.build });

  const ehpValue = Math.max(0, algorithm.calculateEHP(experienceMap));
  const ehbValue = Math.max(0, algorithm.calculateEHB(killcountMap));

  const ehpRank = await computeEfficiencyRank(player, Metric.EHP, ehpValue);
  const ehbRank = await computeEfficiencyRank(player, Metric.EHB, ehbValue);

  const result: ComputePlayerMetricsResult = {
    ttm: algorithm.calculateTTM(experienceMap),
    tt200m: algorithm.calculateTT200mAll(experienceMap),
    ehpValue,
    ehbValue,
    ehpRank,
    ehbRank
  };

  return result;
}

export { computePlayerMetrics };
