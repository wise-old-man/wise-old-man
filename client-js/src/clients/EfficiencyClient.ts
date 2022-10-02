import type { EfficiencyLeaderboardsFilter, EfficiencyAlgorithmTypeUnion } from '../api-types';
import { Metric, SkillMetaConfig, BossMetaConfig, Player } from '../../../server/src/utils';
import { PaginationOptions, sendGetRequest } from '../utils';

export default class EfficiencyClient {
  /**
   * Fetches the current efficiency leaderboard for a specific efficiency metric, playerType, playerBuild and country.
   * @returns A list of players.
   */
  getEfficiencyLeaderboards(filter: EfficiencyLeaderboardsFilter, pagination?: PaginationOptions) {
    return sendGetRequest<Player[]>('/efficiency/leaderboard', { ...filter, ...pagination });
  }

  /**
   * Fetches the top EHP (Efficient Hours Played) rates.
   * @returns A list of skilling methods and their bonus exp ratios.
   */
  getEHPRates(algorithmType: EfficiencyAlgorithmTypeUnion) {
    return sendGetRequest<SkillMetaConfig>('/efficiency/rates', { metric: Metric.EHP, type: algorithmType });
  }

  /**
   * Fetches the top EHB (Efficient Hours Bossed) rates.
   * @returns A list of bosses and their respective "per-hour" kill rates.
   */
  getEHBRates(algorithmType: EfficiencyAlgorithmTypeUnion) {
    return sendGetRequest<BossMetaConfig[]>('/efficiency/rates', { metric: Metric.EHB, type: algorithmType });
  }
}
