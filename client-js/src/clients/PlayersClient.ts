import {
  AchievementProgress,
  ExtendedAchievement,
  FormattedSnapshot,
  MembershipWithGroup,
  Metric,
  Record,
  NameChange,
  ParticipationWithCompetition,
  Period,
  Player,
  PlayerDeltasArray,
  PlayerDeltasMap,
  PlayerDetails,
  PlayerResolvable
} from '../../../server/src/utils';
import { PaginationOptions, sendGetRequest, sendPostRequest } from '../utils';

export type TimeRangeFilter =
  | {
      period: Period | string;
    }
  | {
      startDate: Date;
      endDate: Date;
    };

export interface PlayerRecordsFilter {
  period: Period | string;
  metric: Metric;
}

export interface AssertPlayerTypeResponse {
  player: Player;
  changed: boolean;
}

export interface ImportPlayerResponse {
  count: number;
  message: string;
}

export type SearchPlayersResponse = Player[];
export type UpdatePlayerResponse = PlayerDetails;
export type GetPlayerDetailsResponse = PlayerDetails;
export type GetPlayerAchievementsResponse = ExtendedAchievement[];
export type GetPlayerAchievementProgressResponse = AchievementProgress[];
export type GetPlayerCompetitionsResponse = ParticipationWithCompetition[];
export type GetPlayerGroupsResponse = MembershipWithGroup[];
export type GetPlayerRecordsResponse = Record[];
export type GetPlayerNamesResponse = NameChange[];
export type GetPlayerSnapshotsResponse = FormattedSnapshot[];

export type GetPlayerGainsResponse<T extends PlayerDeltasArray | PlayerDeltasMap> = {
  startsAt: Date;
  endsAt: Date;
  data: T;
};

function getPlayerURL(player: PlayerResolvable) {
  if (typeof player === 'string') {
    return `/players/${player}`;
  }

  if (player.id) {
    return `/players/id/${player.id}`;
  }

  return `/players/${player.username}`;
}

export default class PlayersClient {
  searchPlayers(partialUsername: string, pagination?: PaginationOptions) {
    return sendGetRequest<SearchPlayersResponse>('/players/search', {
      username: partialUsername,
      ...pagination
    });
  }

  updatePlayer(player: PlayerResolvable) {
    return sendPostRequest<UpdatePlayerResponse>(getPlayerURL(player));
  }

  assertPlayerType(player: PlayerResolvable) {
    return sendPostRequest<AssertPlayerTypeResponse>(`${getPlayerURL(player)}/assert-type`);
  }

  importPlayer(player: PlayerResolvable) {
    return sendPostRequest<ImportPlayerResponse>(`${getPlayerURL(player)}/import-history`);
  }

  getPlayerDetails(player: PlayerResolvable) {
    return sendGetRequest<GetPlayerDetailsResponse>(getPlayerURL(player));
  }

  getPlayerAchievements(player: PlayerResolvable) {
    return sendGetRequest<GetPlayerAchievementsResponse>(`${getPlayerURL(player)}/achievements`);
  }

  getPlayerAchievementProgress(player: PlayerResolvable) {
    return sendGetRequest<GetPlayerAchievementProgressResponse>(
      `${getPlayerURL(player)}/achievements/progress`
    );
  }

  getPlayerCompetitions(player: PlayerResolvable, pagination?: PaginationOptions) {
    return sendGetRequest<GetPlayerCompetitionsResponse>(`${getPlayerURL(player)}/competitions`, pagination);
  }

  getPlayerGroups(player: PlayerResolvable, pagination?: PaginationOptions) {
    return sendGetRequest<GetPlayerGroupsResponse>(`${getPlayerURL(player)}/groups`, pagination);
  }

  getPlayerGains(player: PlayerResolvable, options: TimeRangeFilter) {
    return sendGetRequest<GetPlayerGainsResponse<PlayerDeltasMap>>(`${getPlayerURL(player)}/gained`, options);
  }

  getPlayerGainsAsArray(player: PlayerResolvable, options: TimeRangeFilter) {
    return sendGetRequest<GetPlayerGainsResponse<PlayerDeltasArray>>(`${getPlayerURL(player)}/gained`, {
      ...options,
      formatting: 'array'
    });
  }

  getPlayerRecords(player: PlayerResolvable, options?: PlayerRecordsFilter) {
    return sendGetRequest<GetPlayerRecordsResponse>(`${getPlayerURL(player)}/records`, options);
  }

  getPlayerSnapshots(player: PlayerResolvable, options?: TimeRangeFilter) {
    return sendGetRequest<GetPlayerSnapshotsResponse>(`${getPlayerURL(player)}/snapshots`, options);
  }

  getPlayerNames(player: PlayerResolvable) {
    return sendGetRequest<GetPlayerNamesResponse>(`${getPlayerURL(player)}/names`);
  }
}
