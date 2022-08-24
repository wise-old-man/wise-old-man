import type {
  TimeRangeFilter,
  PlayerRecordsFilter,
  SearchPlayersResponse,
  UpdatePlayerResponse,
  AssertPlayerTypeResponse,
  ImportPlayerResponse,
  GetPlayerDetailsResponse,
  GetPlayerAchievementsResponse,
  GetPlayerAchievementProgressResponse,
  GetPlayerCompetitionsResponse,
  GetPlayerGroupsResponse,
  GetPlayerGainsResponse,
  GetPlayerRecordsResponse,
  GetPlayerSnapshotsResponse,
  GetPlayerNamesResponse
} from '../api-types';

import { PlayerResolvable, PlayerDeltasMap, PlayerDeltasArray } from '../../../server/src/utils';
import { PaginationOptions, sendGetRequest, sendPostRequest } from '../utils';

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

function getPlayerURL(player: PlayerResolvable) {
  if (typeof player === 'string') {
    return `/players/${player}`;
  }

  if (player.id) {
    return `/players/id/${player.id}`;
  }

  return `/players/${player.username}`;
}
