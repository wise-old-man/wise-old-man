import redisService from '../../../api/services/external/redis.service';
import { getAlgorithmType } from '../../../api/modules/efficiency/efficiency.utils';
import {
  ComputedMetric,
  EfficiencyAlgorithmType,
  PLAYER_BUILDS,
  PLAYER_TYPES,
  PlayerType,
  PlayerBuild
} from '../../../utils';
import prisma from '../../../prisma';
import { JobType, JobDefinition } from '../job.types';

// The higher the resolution, the more accurate the estimates are, but the more memory is used
export const RANK_RESOLUTION = 10;

class CalculateComputedMetricRankTablesJob implements JobDefinition<unknown> {
  type: JobType;

  constructor() {
    this.type = JobType.CALCULATE_COMPUTED_METRIC_RANK_TABLES;
  }

  async execute() {
    await updateRankMaps(ComputedMetric.EHP);
    await updateRankMaps(ComputedMetric.EHB);
  }
}

async function updateRankMaps(metric: ComputedMetric) {
  const map = new Map<EfficiencyAlgorithmType, Record<number, number>>();

  for (const playerType of PLAYER_TYPES) {
    if (playerType === PlayerType.UNKNOWN) continue;

    for (const playerBuild of PLAYER_BUILDS) {
      const entries = await getRankTableEntries(metric, playerType, playerBuild);

      let sum = 0;
      const obj: Record<number, number> = {};

      entries.forEach(entry => {
        obj[entry.threshold] = entry.count + sum;
        sum += entry.count;
      });

      const algorithmType = getAlgorithmType({ type: playerType, build: playerBuild });

      if (map.has(algorithmType)) {
        const data = map.get(algorithmType);

        for (const [key, value] of Object.entries(obj)) {
          if (data[key]) {
            data[key] += value;
          } else {
            data[key] = value;
          }
        }
      } else {
        map.set(algorithmType, obj);
      }
    }
  }

  for (const [algorithmType, data] of Array.from(map.entries())) {
    await redisService.setValue(`${metric}_rank_table`, algorithmType, JSON.stringify(data));
  }
}

async function getRankTableEntries(metric: ComputedMetric, type: PlayerType, build: PlayerBuild) {
  return await prisma.$queryRawUnsafe<Array<{ threshold: number; count: number }>>(`
    SELECT (FLOOR("${metric}" / ${RANK_RESOLUTION}) * ${RANK_RESOLUTION})::int AS "threshold", COUNT(*)::int FROM public.players
    WHERE "type" = '${type}' AND "build" = '${build}'
    GROUP BY "threshold"
    ORDER BY "threshold" DESC
  `);
}

export default new CalculateComputedMetricRankTablesJob();
