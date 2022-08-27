import { DeltaLeaderboardEntry } from '../../../server/src/utils';
import type { DeltaLeaderboardFilter } from '../api-types';

import { sendGetRequest } from '../utils';

export default class DeltasClient {
  /**
   * Fetches the current top leaderboard for a specific metric, period, playerType, playerBuild and country.
   * @returns A list of deltas, with their respective players, values and dates included.
   */
  getDeltaLeaderboard(filter: DeltaLeaderboardFilter) {
    return sendGetRequest<DeltaLeaderboardEntry[]>('/deltas/leaderboard', filter);
  }
}
