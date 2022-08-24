import type { DeltaLeaderboardFilter, GetDeltaLeaderboardResponse } from '../api-types';

import { sendGetRequest } from '../utils';

export default class DeltasClient {
  getDeltaLeaderboard(filter: DeltaLeaderboardFilter) {
    return sendGetRequest<GetDeltaLeaderboardResponse>('/deltas/leaderboard', filter);
  }
}
