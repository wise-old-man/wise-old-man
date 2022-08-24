import { Country, Metric, Period, Player, PlayerBuild, PlayerType } from '../../../server/src/utils';
import { sendGetRequest } from '../utils';

export interface DeltaLeaderboardFilter {
  metric: Metric;
  period: Period | string;
  country?: Country;
  playerType?: PlayerType;
  playerBuild?: PlayerBuild;
}

export type GetDeltaLeaderboardResponse = Array<{
  startDate: Date;
  endDate: Date;
  gained: number;
  player: Player;
}>;

export default class DeltasClient {
  getDeltaLeaderboard(filter: DeltaLeaderboardFilter) {
    return sendGetRequest<GetDeltaLeaderboardResponse>('/deltas/leaderboard', filter);
  }
}
