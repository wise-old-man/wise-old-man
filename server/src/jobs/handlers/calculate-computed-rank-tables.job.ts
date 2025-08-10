import { getAlgorithmType } from '../../api/modules/efficiency/efficiency.utils';
import prisma from '../../prisma';
import logger from '../../services/logging.service';
import { buildCompoundRedisKey, redisClient } from '../../services/redis.service';
import {
  ComputedMetric,
  EfficiencyAlgorithmType,
  PLAYER_BUILDS,
  PLAYER_TYPES,
  PlayerBuild,
  PlayerType
} from '../../types';

import { Job } from '../job.class';

// The higher the resolution, the more accurate the estimates are, but the more memory is used
export const RANK_RESOLUTION = 10;

export class CalculateComputedRankTablesJob extends Job<unknown> {
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
      try {
        const entries = await getRankTableEntries(metric, playerType, playerBuild);

        let sum = 0;
        const obj: Record<number, number> = {};

        entries.forEach(entry => {
          obj[entry.threshold] = entry.count + sum;
          sum += entry.count;
        });

        const algorithmType = getAlgorithmType({ type: playerType, build: playerBuild });

        const data = map.get(algorithmType);

        if (data) {
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
      } catch (_e) {
        // Don't abort the whole job, just skip this player type and build
      }
    }
  }

  logger.info(`Storing rank table data...`, { metric }, true);

  for (const [algorithmType, data] of Array.from(map.entries())) {
    await redisClient
      .set(buildCompoundRedisKey(`${metric}_rank_table`, algorithmType), JSON.stringify(data))
      .catch(() => {
        // Don't abort the whole job, just skip this player type and build
      });
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
