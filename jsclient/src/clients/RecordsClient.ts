import type { Player, Record } from '../../../server/src/prisma';
import type { PlayerBuild, PlayerType } from '../../../server/src/utils';

import { Country, Metric, Period } from '../../../server/src/utils';
import { sendGetRequest } from '../utils';

export interface RecordLeaderboardFilter {
  metric: Metric;
  period: Period | string;
  country?: Country;
  playerType?: PlayerType;
  playerBuild?: PlayerBuild;
}

export type GetRecordLeaderboardResponse = Array<Record & { player: Player }>;

export default class RecordsClient {
  getRecordLeaderboard(filter: RecordLeaderboardFilter) {
    return sendGetRequest<GetRecordLeaderboardResponse>('/records/leaderboard', filter);
  }
}
