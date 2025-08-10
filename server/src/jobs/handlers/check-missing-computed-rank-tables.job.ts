import { getAlgorithmType } from '../../api/modules/efficiency/efficiency.utils';
import { buildCompoundRedisKey, redisClient } from '../../services/redis.service';
import { COMPUTED_METRICS, PLAYER_BUILDS, PLAYER_TYPES, PlayerType } from '../../types';
import { Job } from '../job.class';
import { JobType } from '../types/job-type.enum';

export class CheckMissingComputedRankTablesJob extends Job<unknown> {
  async execute() {
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

    this.jobManager.add(JobType.CALCULATE_COMPUTED_RANK_TABLES, {});
  }
}
