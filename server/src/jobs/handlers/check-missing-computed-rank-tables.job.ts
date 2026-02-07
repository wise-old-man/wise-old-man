import { getAlgorithmType } from '../../api/modules/efficiency/efficiency.utils';
import { buildCompoundRedisKey, redisClient } from '../../services/redis.service';
import { COMPUTED_METRICS, PLAYER_BUILDS, PLAYER_TYPES, PlayerType } from '../../types';
import { JobHandler } from '../types/job-handler.type';
import { JobType } from '../types/job-type.enum';

export const CheckMissingComputedRankTablesJobHandler: JobHandler<unknown> = {
  async execute(_payload, context) {
    let isMissingData = false;

    for (const metric of COMPUTED_METRICS) {
      for (const playerType of PLAYER_TYPES) {
        if (playerType === PlayerType.UNKNOWN) continue;

        for (const playerBuild of PLAYER_BUILDS) {
          const algorithmType = getAlgorithmType({ type: playerType, build: playerBuild });

          // Check if the cached rank table exists
          const cachedResult = await redisClient.get(
            buildCompoundRedisKey(`${metric}_rank_table`, algorithmType)
          );

          if (cachedResult === null) {
            isMissingData = true;
          }
        }
      }
    }

    if (!isMissingData) {
      return;
    }

    context.jobManager.add(JobType.CALCULATE_COMPUTED_RANK_TABLES, {});
  }
};
