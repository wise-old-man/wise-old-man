import { getAlgorithmType } from '../../api/modules/efficiency/efficiency.utils';
import redisService from '../../api/services/external/redis.service';
import logger from '../../api/util/logging';
import prisma from '../../prisma';
import {
  ComputedMetric,
  EfficiencyAlgorithmType,
  PLAYER_BUILDS,
  PLAYER_TYPES,
  PlayerBuild,
  PlayerType
} from '../../utils';
import { Job } from '../job.utils';

// The higher the resolution, the more accurate the estimates are, but the more memory is used
export const RANK_RESOLUTION = 10;

export class CalculateComputedMetricRankTablesJob extends Job<unknown> {
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
        logger.info(`Querying rank table data...`, { metric, playerType, playerBuild }, true);
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
    await redisService.setValue(`${metric}_rank_table`, algorithmType, JSON.stringify(data)).catch(() => {
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
