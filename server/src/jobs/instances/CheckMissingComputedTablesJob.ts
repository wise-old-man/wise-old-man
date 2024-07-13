import { getAlgorithmType } from '../../api/modules/efficiency/efficiency.utils';
import redisService from '../../api/services/external/redis.service';
import { PLAYER_TYPES, PLAYER_BUILDS, PlayerType, COMPUTED_METRICS } from '../../utils';
import { Job } from '../job.utils';

export class CheckMissingComputedTablesJob extends Job<unknown> {
  async execute(): Promise<void> {
    let isMissingData = false;

    for (const metric of COMPUTED_METRICS) {
      for (const playerType of PLAYER_TYPES) {
        if (playerType === PlayerType.UNKNOWN) continue;

        for (const playerBuild of PLAYER_BUILDS) {
          // Check if the cached rank table exists
          const cachedResult = await redisService.getValue(
            `${metric}_rank_table`,
            getAlgorithmType({ type: playerType, build: playerBuild })
          );

          if (cachedResult === null) {
            isMissingData = true;
          }
        }
      }
    }

    if (isMissingData) {
      this.jobManager.add('CalculateComputedMetricRankTablesJob');
    }
  }
}
