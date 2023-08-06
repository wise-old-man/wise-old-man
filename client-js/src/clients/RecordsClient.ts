import { RecordLeaderboardEntry } from '../../../server/src/utils';
import { RecordLeaderboardFilter } from '../api-types';
import BaseAPIClient from './BaseAPIClient';

export default class RecordsClient extends BaseAPIClient {
  /**
   * Fetches the current records leaderboard for a specific metric, period, playerType, playerBuild and country.
   * @returns A list of records, with their respective players, dates and values included.
   */
  getRecordLeaderboard(filter: RecordLeaderboardFilter) {
    return this.http.getRequest<RecordLeaderboardEntry[]>('/records/leaderboard', filter);
  }
}
