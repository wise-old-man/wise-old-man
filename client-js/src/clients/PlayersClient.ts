import type {
  TimeRangeFilter,
  PlayerRecordsFilter,
  AssertPlayerTypeResponse,
  GetPlayerGainsResponse,
  PlayerCompetitionsFilter
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
  MembershipWithGroup,
  ParticipationWithCompetitionAndStandings
} from '../../../server/src/utils';
import { PaginationOptions } from '../utils';
import BaseAPIClient from './BaseAPIClient';

export default class PlayersClient extends BaseAPIClient {
  /**
   * Searches players by partial username.
   * @returns A list of players.
   */
  searchPlayers(partialUsername: string, pagination?: PaginationOptions) {
    return this.getRequest<Player[]>('/players/search', { username: partialUsername, ...pagination });
  }

  /**
   * Updates/tracks a player.
   * @returns The player's new details, including the latest snapshot.
   */
  updatePlayer(player: PlayerResolvable) {
    return this.postRequest<PlayerDetails>(getPlayerURL(player));
  }

  /**
   * Asserts (and attempts to fix, if necessary) a player's game-mode type.
   * @returns The updated player, and an indication of whether the type was changed.
   */
  assertPlayerType(player: PlayerResolvable) {
    return this.postRequest<AssertPlayerTypeResponse>(`${getPlayerURL(player)}/assert-type`);
  }

  /**
   * Fetches a player's details.
   * @returns The player's details, including the latest snapshot.
   */
  getPlayerDetails(player: PlayerResolvable) {
    return this.getRequest<PlayerDetails>(getPlayerURL(player));
  }

  /**
   * Fetches a player's current achievements.
   * @returns A list of achievements.
   */
  getPlayerAchievements(player: PlayerResolvable) {
    return this.getRequest<ExtendedAchievement[]>(`${getPlayerURL(player)}/achievements`);
  }

  /**
   * Fetches a player's current achievement progress.
   * @returns A list of achievements (completed or otherwise), with their respective relative/absolute progress percentage.
   */
  getPlayerAchievementProgress(player: PlayerResolvable) {
    return this.getRequest<AchievementProgress[]>(`${getPlayerURL(player)}/achievements/progress`);
  }

  /**
   * Fetches all of the player's competition participations.
   * @returns A list of participations, with the respective competition included.
   */
  getPlayerCompetitions(
    player: PlayerResolvable,
    filter?: PlayerCompetitionsFilter,
    pagination?: PaginationOptions
  ) {
    return this.getRequest<ParticipationWithCompetition[]>(`${getPlayerURL(player)}/competitions`, {
      ...filter,
      ...pagination
    });
  }

  /**
   * Fetches all of the player's competition participations' standings.
   * @returns A list of participations, with the respective competition, rank and progress included.
   */
  getPlayerCompetitionStandings(player: PlayerResolvable, filter: PlayerCompetitionsFilter) {
    return this.getRequest<ParticipationWithCompetitionAndStandings[]>(
      `${getPlayerURL(player)}/competitions/standings`,
      filter
    );
  }

  /**
   * Fetches all of the player's group memberships.
   * @returns A list of memberships, with the respective group included.
   */
  getPlayerGroups(player: PlayerResolvable, pagination?: PaginationOptions) {
    return this.getRequest<MembershipWithGroup[]>(`${getPlayerURL(player)}/groups`, pagination);
  }

  /**
   * Fetches a player's gains, for a specific period or time range, as a [metric: data] map.
   * @returns A map of each metric's gained data.
   */
  getPlayerGains(player: PlayerResolvable, options: TimeRangeFilter) {
    return this.getRequest<GetPlayerGainsResponse<PlayerDeltasMap>>(
      `${getPlayerURL(player)}/gained`,
      options
    );
  }

  /**
   * Fetches a player's gains, for a specific period or time range, as an array.
   * @returns An array of each metric's gained data.
   */
  getPlayerGainsAsArray(player: PlayerResolvable, options: TimeRangeFilter) {
    return this.getRequest<GetPlayerGainsResponse<PlayerDeltasArray>>(`${getPlayerURL(player)}/gained`, {
      ...options,
      formatting: 'array'
    });
  }

  /**
   * Fetches all of the player's records.
   * @returns A list of records.
   */
  getPlayerRecords(player: PlayerResolvable, options?: PlayerRecordsFilter) {
    return this.getRequest<Record[]>(`${getPlayerURL(player)}/records`, options);
  }

  /**
   * Fetches all of the player's past snapshots.
   * @returns A list of snapshots.
   */
  getPlayerSnapshots(player: PlayerResolvable, options?: TimeRangeFilter, pagination?: PaginationOptions) {
    return this.getRequest<FormattedSnapshot[]>(`${getPlayerURL(player)}/snapshots`, {
      ...options,
      ...pagination
    });
  }

  /**
   * Fetches all of the player's approved name changes.
   * @returns A list of name changes.
   */
  getPlayerNames(player: PlayerResolvable) {
    return this.getRequest<NameChange[]>(`${getPlayerURL(player)}/names`);
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
