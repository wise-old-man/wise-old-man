import { z } from 'zod';
import { Snapshot } from '../../../../prisma';
import { PlayerType, PlayerBuild, Metric } from '../../../../utils';
import { getAlgorithm, getExperienceMap, getKillcountMap } from '../efficiency.utils';
import { computeEfficiencyRank } from './ComputeEfficiencyRankService';

const inputSchema = z.object({
  player: z.object({
    id: z.number().int().positive(),
    type: z.nativeEnum(PlayerType),
    build: z.nativeEnum(PlayerBuild)
  })
});

type ComputePlayerMetricsParams = z.infer<typeof inputSchema> & { snapshot: Snapshot };

interface ComputePlayerMetricsResult {
  ttm: number;
  tt200m: number;
  ehpValue: number;
  ehpRank: number;
  ehbValue: number;
  ehbRank: number;
}

async function computePlayerMetrics(payload: ComputePlayerMetricsParams) {
  const { player, snapshot } = { ...inputSchema.parse(payload), snapshot: payload.snapshot };

  if (!snapshot) return null;

  const killcountMap = getKillcountMap(snapshot);
  const experienceMap = getExperienceMap(snapshot);

  const algorithm = getAlgorithm({ type: player.type, build: player.build });

  const ehpValue = Math.max(0, algorithm.calculateEHP(experienceMap));
  const ehbValue = Math.max(0, algorithm.calculateEHB(killcountMap));

  const ehpRank = await computeEfficiencyRank({
    player,
    metric: Metric.EHP,
    value: ehpValue
  });

  const ehbRank = await computeEfficiencyRank({
    player,
    metric: Metric.EHB,
    value: ehbValue
  });

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
