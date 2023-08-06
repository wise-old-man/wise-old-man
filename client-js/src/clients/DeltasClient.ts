import { DeltaLeaderboardEntry } from '../../../server/src/utils';
import type { DeltaLeaderboardFilter } from '../api-types';
import BaseAPIClient from './BaseAPIClient';

export default class DeltasClient extends BaseAPIClient {
  /**
   * Fetches the current top leaderboard for a specific metric, period, playerType, playerBuild and country.
   * @returns A list of deltas, with their respective players, values and dates included.
   */
  getDeltaLeaderboard(filter: DeltaLeaderboardFilter) {
    return this.http.getRequest<DeltaLeaderboardEntry[]>('/deltas/leaderboard', filter);
  }
}
