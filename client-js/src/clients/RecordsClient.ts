import { RecordLeaderboardFilter, GetRecordLeaderboardResponse } from '../api-types';
import { sendGetRequest } from '../utils';

export default class RecordsClient {
  getRecordLeaderboard(filter: RecordLeaderboardFilter) {
    return sendGetRequest<GetRecordLeaderboardResponse>('/records/leaderboard', filter);
  }
}
