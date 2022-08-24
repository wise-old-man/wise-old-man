import {
  Player,
  Metric,
  Country,
  PlayerType,
  PlayerBuild,
  EfficiencyAlgorithmType,
  SkillMetaConfig,
  BossMetaConfig
} from '../../../server/src/utils';
import { PaginationOptions, sendGetRequest } from '../utils';

export interface EfficiencyLeaderboardsFilter {
  metric: typeof Metric.EHP | typeof Metric.EHB | 'ehp+ehb';
  country?: Country;
  playerType?: PlayerType;
  playerBuild?: PlayerBuild;
}

export type GetEfficiencyLeaderboardsResponse = Player[];

export default class EfficiencyClient {
  getEfficiencyLeaderboards(filter: EfficiencyLeaderboardsFilter, pagination?: PaginationOptions) {
    return sendGetRequest<GetEfficiencyLeaderboardsResponse>('/efficiency/leaderboard', {
      ...filter,
      ...pagination
    });
  }

  getEHPRates(algorithmType: `${EfficiencyAlgorithmType}`) {
    return sendGetRequest<SkillMetaConfig>('/efficiency/rates', { metric: Metric.EHP, type: algorithmType });
  }

  getEHBRates(algorithmType: `${EfficiencyAlgorithmType}`) {
    return sendGetRequest<BossMetaConfig[]>('/efficiency/rates', { metric: Metric.EHB, type: algorithmType });
  }
}
