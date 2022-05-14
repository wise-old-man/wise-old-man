import { PlayerBuild } from '@wise-old-man/utils';
import { z } from 'zod';
import { PlayerTypeEnum, Snapshot, VirtualEnum } from '../../../../prisma';
import * as efficiencyUtils from '../efficiency.utils';
import * as efficiencyServices from '../efficiency.services';

const inputSchema = z.object({
  player: z.object({
    id: z.number().int().positive(),
    type: z.nativeEnum(PlayerTypeEnum),
    build: z.nativeEnum(PlayerBuild)
  })
});

type ComputePlayerVirtualsParams = z.infer<typeof inputSchema> & { snapshot: Snapshot };

interface ComputePlayerVirtualsResult {
  ttm: number;
  tt200m: number;
  ehpValue: number;
  ehpRank: number;
  ehbValue: number;
  ehbRank: number;
}

async function computePlayerVirtuals(payload: ComputePlayerVirtualsParams) {
  const { player, snapshot } = { ...inputSchema.parse(payload), snapshot: payload.snapshot };

  const killcountMap = efficiencyUtils.getKillcountMap(snapshot);
  const experienceMap = efficiencyUtils.getExperienceMap(snapshot);

  const algorithm = efficiencyUtils.getAlgorithm({ type: player.type, build: player.build });

  const ehpValue = algorithm.calculateEHP(experienceMap);
  const ehbValue = algorithm.calculateEHB(killcountMap);

  const ehpRank = await efficiencyServices.computeEfficiencyRank({
    player,
    metric: VirtualEnum.EHP,
    value: ehpValue
  });

  const ehbRank = await efficiencyServices.computeEfficiencyRank({
    player,
    metric: VirtualEnum.EHB,
    value: ehpValue
  });

  const result: ComputePlayerVirtualsResult = {
    ttm: algorithm.calculateTTM(experienceMap),
    tt200m: algorithm.calculateTT200m(experienceMap),
    ehpValue,
    ehbValue,
    ehpRank,
    ehbRank
  };

  return result;
}

export { computePlayerVirtuals };
