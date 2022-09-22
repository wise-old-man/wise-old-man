import { z } from 'zod';
import { Snapshot } from '../../../../prisma';
import { PlayerType, PlayerBuild, Metric } from '../../../../utils';
import * as efficiencyUtils from '../efficiency.utils';
import * as efficiencyServices from '../efficiency.services';

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

  const killcountMap = efficiencyUtils.getKillcountMap(snapshot);
  const experienceMap = efficiencyUtils.getExperienceMap(snapshot);

  const algorithm = efficiencyUtils.getAlgorithm({ type: player.type, build: player.build });

  const ehpValue = algorithm.calculateEHP(experienceMap);
  const ehbValue = algorithm.calculateEHB(killcountMap);

  const ehpRank = await efficiencyServices.computeEfficiencyRank({
    player,
    metric: Metric.EHP,
    value: ehpValue
  });

  const ehbRank = await efficiencyServices.computeEfficiencyRank({
    player,
    metric: Metric.EHB,
    value: ehpValue
  });

  const result: ComputePlayerMetricsResult = {
    ttm: algorithm.calculateTTM(experienceMap),
    tt200m: algorithm.calculateTT200m(experienceMap),
    ehpValue,
    ehbValue,
    ehpRank,
    ehbRank
  };

  return result;
}

export { computePlayerMetrics };
