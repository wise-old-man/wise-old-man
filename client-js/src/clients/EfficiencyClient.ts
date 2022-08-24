import type {
  EfficiencyLeaderboardsFilter,
  EfficiencyAlgorithmTypeUnion,
  GetEfficiencyLeaderboardsResponse
} from '../api-types';
import { Metric, SkillMetaConfig, BossMetaConfig } from '../../../server/src/utils';
import { PaginationOptions, sendGetRequest } from '../utils';

export default class EfficiencyClient {
  getEfficiencyLeaderboards(filter: EfficiencyLeaderboardsFilter, pagination?: PaginationOptions) {
    return sendGetRequest<GetEfficiencyLeaderboardsResponse>('/efficiency/leaderboard', {
      ...filter,
      ...pagination
    });
  }

  getEHPRates(algorithmType: EfficiencyAlgorithmTypeUnion) {
    return sendGetRequest<SkillMetaConfig>('/efficiency/rates', { metric: Metric.EHP, type: algorithmType });
  }

  getEHBRates(algorithmType: EfficiencyAlgorithmTypeUnion) {
    return sendGetRequest<BossMetaConfig[]>('/efficiency/rates', { metric: Metric.EHB, type: algorithmType });
  }
}
