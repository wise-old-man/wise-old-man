import type { Country, Metric, Period, PlayerBuild, PlayerResponse, PlayerType } from '../api-types';
import BaseAPIClient from './BaseAPIClient';

export default class DeltasClient extends BaseAPIClient {
  /**
   * Fetches the current top leaderboard for a specific metric, period, playerType, playerBuild and country.
   * @returns A list of deltas, with their respective players, values and dates included.
   */
  getDeltaLeaderboard(filter: {
    country?: Country;
    playerType?: PlayerType;
    playerBuild?: PlayerBuild;
    metric: Metric;
    period: Period | string;
  }) {
    return this.getRequest<
      Array<{
        player: PlayerResponse;
        startDate: Date;
        endDate: Date;
        gained: number;
      }>
    >('/deltas/leaderboard', filter);
  }
}
