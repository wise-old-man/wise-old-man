import { RecordLeaderboardEntry } from '../../../server/src/utils';
import { RecordLeaderboardFilter } from '../api-types';
import { sendGetRequest } from '../utils';

export default class RecordsClient {
  /**
   * Fetches the current records leaderboard for a specific metric, period, playerType, playerBuild and country.
   * @returns A list of records, with their respective players, dates and values included.
   */
  getRecordLeaderboard(filter: RecordLeaderboardFilter) {
    return sendGetRequest<RecordLeaderboardEntry[]>('/records/leaderboard', filter);
  }
}
