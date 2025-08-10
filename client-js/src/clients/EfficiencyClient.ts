import {
  BossMetaConfig,
  Country,
  EfficiencyAlgorithmType,
  Metric,
  PlayerBuild,
  PlayerResponse,
  PlayerType,
  SkillMetaConfig
} from '../api-types';
import { PaginationOptions } from '../utils';
import BaseAPIClient from './BaseAPIClient';

export default class EfficiencyClient extends BaseAPIClient {
  /**
   * Fetches the current efficiency leaderboard for a specific efficiency metric, playerType, playerBuild and country.
   * @returns A list of players.
   */
  getEfficiencyLeaderboards(
    filter: {
      country?: Country;
      playerType?: PlayerType;
      playerBuild?: PlayerBuild;
      metric: typeof Metric.EHP | typeof Metric.EHB | 'ehp+ehb';
    },
    pagination?: PaginationOptions
  ) {
    return this.getRequest<PlayerResponse[]>('/efficiency/leaderboard', { ...filter, ...pagination });
  }

  /**
   * Fetches the top EHP (Efficient Hours Played) rates.
   * @returns A list of skilling methods and their bonus exp ratios.
   */
  getEHPRates(algorithmType: `${EfficiencyAlgorithmType}`) {
    return this.getRequest<SkillMetaConfig[]>('/efficiency/rates', {
      metric: Metric.EHP,
      type: algorithmType
    });
  }

  /**
   * Fetches the top EHB (Efficient Hours Bossed) rates.
   * @returns A list of bosses and their respective "per-hour" kill rates.
   */
  getEHBRates(algorithmType: `${EfficiencyAlgorithmType}`) {
    return this.getRequest<BossMetaConfig[]>('/efficiency/rates', {
      metric: Metric.EHB,
      type: algorithmType
    });
  }
}
