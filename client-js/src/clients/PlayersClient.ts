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
  /**
   * Searches players by partial username.
   * @returns A list of players.
   */
  searchPlayers(partialUsername: string, pagination?: PaginationOptions) {
    return sendGetRequest<Player[]>('/players/search', { username: partialUsername, ...pagination });
  }

  /**
   * Updates/tracks a player.
   * @returns The player's new details, including the latest snapshot.
   */
  updatePlayer(player: PlayerResolvable) {
    return sendPostRequest<PlayerDetails>(getPlayerURL(player));
  }

  /**
   * Asserts (and attempts to fix, if necessary) a player's game-mode type.
   * @returns The updated player, and an indication of whether the type was changed.
   */
  assertPlayerType(player: PlayerResolvable) {
    return sendPostRequest<AssertPlayerTypeResponse>(`${getPlayerURL(player)}/assert-type`);
  }

  /**
   * Attempts to import a player's snapshot history from CrystalMathLabs.
   * @returns The number of snapshots that were imported.
   */
  importPlayer(player: PlayerResolvable) {
    return sendPostRequest<GenericCountMessageResponse>(`${getPlayerURL(player)}/import-history`);
  }

  /**
   * Fetches a player's details.
   * @returns The player's details, including the latest snapshot.
   */
  getPlayerDetails(player: PlayerResolvable) {
    return sendGetRequest<PlayerDetails>(getPlayerURL(player));
  }

  /**
   * Fetches a player's current achievements.
   * @returns A list of achievements.
   */
  getPlayerAchievements(player: PlayerResolvable) {
    return sendGetRequest<ExtendedAchievement[]>(`${getPlayerURL(player)}/achievements`);
  }

  /**
   * Fetches a player's current achievement progress.
   * @returns A list of achievements (completed or otherwise), with their respective relative/absolute progress percentage.
   */
  getPlayerAchievementProgress(player: PlayerResolvable) {
    return sendGetRequest<AchievementProgress[]>(`${getPlayerURL(player)}/achievements/progress`);
  }

  /**
   * Fetches all of the player's competition participations.
   * @returns A list of participations, with the respective competition included.
   */
  getPlayerCompetitions(player: PlayerResolvable, pagination?: PaginationOptions) {
    return sendGetRequest<ParticipationWithCompetition[]>(`${getPlayerURL(player)}/competitions`, pagination);
  }

  /**
   * Fetches all of the player's group memberships.
   * @returns A list of memberships, with the respective group included.
   */
  getPlayerGroups(player: PlayerResolvable, pagination?: PaginationOptions) {
    return sendGetRequest<MembershipWithGroup[]>(`${getPlayerURL(player)}/groups`, pagination);
  }

  /**
   * Fetches a player's gains, for a specific period or time range, as a [metric: data] map.
   * @returns A map of each metric's gained data.
   */
  getPlayerGains(player: PlayerResolvable, options: TimeRangeFilter) {
    return sendGetRequest<GetPlayerGainsResponse<PlayerDeltasMap>>(`${getPlayerURL(player)}/gained`, options);
  }

  /**
   * Fetches a player's gains, for a specific period or time range, as an array.
   * @returns An array of each metric's gained data.
   */
  getPlayerGainsAsArray(player: PlayerResolvable, options: TimeRangeFilter) {
    return sendGetRequest<GetPlayerGainsResponse<PlayerDeltasArray>>(`${getPlayerURL(player)}/gained`, {
      ...options,
      formatting: 'array'
    });
  }

  /**
   * Fetches all of the player's records.
   * @returns A list of records.
   */
  getPlayerRecords(player: PlayerResolvable, options?: PlayerRecordsFilter) {
    return sendGetRequest<Record[]>(`${getPlayerURL(player)}/records`, options);
  }

  /**
   * Fetches all of the player's past snapshots.
   * @returns A list of snapshots.
   */
  getPlayerSnapshots(player: PlayerResolvable, options?: TimeRangeFilter) {
    return sendGetRequest<FormattedSnapshot[]>(`${getPlayerURL(player)}/snapshots`, options);
  }

  /**
   * Fetches all of the player's approved name changes.
   * @returns A list of name changes.
   */
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
