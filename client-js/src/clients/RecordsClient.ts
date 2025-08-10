import {
  Country,
  Metric,
  Period,
  PlayerBuild,
  PlayerResponse,
  PlayerType,
  RecordResponse
} from '../api-types';
import BaseAPIClient from './BaseAPIClient';

export default class RecordsClient extends BaseAPIClient {
  /**
   * Fetches the current records leaderboard for a specific metric, period, playerType, playerBuild and country.
   * @returns A list of records, with their respective players, dates and values included.
   */
  getRecordLeaderboard(filter: {
    country?: Country;
    playerType?: PlayerType;
    playerBuild?: PlayerBuild;
    metric: Metric;
    period: Period;
  }) {
    return this.getRequest<Array<RecordResponse & { player: PlayerResponse }>>(
      '/records/leaderboard',
      filter
    );
  }
}
