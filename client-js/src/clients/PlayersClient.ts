import type {
  TimeRangeFilter,
  PlayerRecordsFilter,
  AssertPlayerTypeResponse,
  GetPlayerGainsResponse,
  GenericCountMessageResponse
} from '../api-types';
import {
  PlayerResolvable,
  PlayerDeltasMap,
  PlayerDeltasArray,
  Record,
  Player,
  PlayerDetails,
  NameChange,
  AchievementProgress,
  ExtendedAchievement,
  ParticipationWithCompetition,
  FormattedSnapshot,
  MembershipWithGroup
} from '../../../server/src/utils';
import { PaginationOptions, sendGetRequest, sendPostRequest } from '../utils';

export default class PlayersClient {
  searchPlayers(partialUsername: string, pagination?: PaginationOptions) {
    return sendGetRequest<Player[]>('/players/search', {
      username: partialUsername,
      ...pagination
    });
  }

  updatePlayer(player: PlayerResolvable) {
    return sendPostRequest<PlayerDetails>(getPlayerURL(player));
  }

  assertPlayerType(player: PlayerResolvable) {
    return sendPostRequest<AssertPlayerTypeResponse>(`${getPlayerURL(player)}/assert-type`);
  }

  importPlayer(player: PlayerResolvable) {
    return sendPostRequest<GenericCountMessageResponse>(`${getPlayerURL(player)}/import-history`);
  }

  getPlayerDetails(player: PlayerResolvable) {
    return sendGetRequest<PlayerDetails>(getPlayerURL(player));
  }

  getPlayerAchievements(player: PlayerResolvable) {
    return sendGetRequest<ExtendedAchievement[]>(`${getPlayerURL(player)}/achievements`);
  }

  getPlayerAchievementProgress(player: PlayerResolvable) {
    return sendGetRequest<AchievementProgress[]>(`${getPlayerURL(player)}/achievements/progress`);
  }

  getPlayerCompetitions(player: PlayerResolvable, pagination?: PaginationOptions) {
    return sendGetRequest<ParticipationWithCompetition[]>(`${getPlayerURL(player)}/competitions`, pagination);
  }

  getPlayerGroups(player: PlayerResolvable, pagination?: PaginationOptions) {
    return sendGetRequest<MembershipWithGroup[]>(`${getPlayerURL(player)}/groups`, pagination);
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
    return sendGetRequest<Record[]>(`${getPlayerURL(player)}/records`, options);
  }

  getPlayerSnapshots(player: PlayerResolvable, options?: TimeRangeFilter) {
    return sendGetRequest<FormattedSnapshot[]>(`${getPlayerURL(player)}/snapshots`, options);
  }

  getPlayerNames(player: PlayerResolvable) {
    return sendGetRequest<NameChange[]>(`${getPlayerURL(player)}/names`);
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
