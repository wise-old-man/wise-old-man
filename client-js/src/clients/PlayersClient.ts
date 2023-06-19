import type {
  TimeRangeFilter,
  PlayerRecordsFilter,
  AssertPlayerTypeResponse,
  GetPlayerGainsResponse,
  PlayerCompetitionsFilter
} from '../api-types';
import {
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
  ParticipationWithCompetitionAndStandings,
  Metric
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
  updatePlayer(username: string) {
    return this.postRequest<PlayerDetails>(`/players/${username}`);
  }

  /**
   * Asserts (and attempts to fix, if necessary) a player's game-mode type.
   * @returns The updated player, and an indication of whether the type was changed.
   */
  assertPlayerType(username: string) {
    return this.postRequest<AssertPlayerTypeResponse>(`/players/${username}/assert-type`);
  }

  /**
   * Fetches a player's details.
   * @returns The player's details, including the latest snapshot.
   */
  getPlayerDetails(username: string) {
    return this.getRequest<PlayerDetails>(`/players/${username}`);
  }

  /**
   * Fetches a player's details by ID.
   * @returns The player's details, including the latest snapshot.
   */
  getPlayerDetailsById(id: number) {
    return this.getRequest<PlayerDetails>(`/players/id/${id}`);
  }

  /**
   * Fetches a player's current achievements.
   * @returns A list of achievements.
   */
  getPlayerAchievements(username: string) {
    return this.getRequest<ExtendedAchievement[]>(`/players/${username}/achievements`);
  }

  /**
   * Fetches a player's current achievement progress.
   * @returns A list of achievements (completed or otherwise), with their respective relative/absolute progress percentage.
   */
  getPlayerAchievementProgress(username: string) {
    return this.getRequest<AchievementProgress[]>(`/players/${username}/achievements/progress`);
  }

  /**
   * Fetches all of the player's competition participations.
   * @returns A list of participations, with the respective competition included.
   */
  getPlayerCompetitions(username: string, filter?: PlayerCompetitionsFilter, pagination?: PaginationOptions) {
    return this.getRequest<ParticipationWithCompetition[]>(`/players/${username}/competitions`, {
      ...filter,
      ...pagination
    });
  }

  /**
   * Fetches all of the player's competition participations' standings.
   * @returns A list of participations, with the respective competition, rank and progress included.
   */
  getPlayerCompetitionStandings(username: string, filter: PlayerCompetitionsFilter) {
    return this.getRequest<ParticipationWithCompetitionAndStandings[]>(
      `/players/${username}/competitions/standings`,
      filter
    );
  }

  /**
   * Fetches all of the player's group memberships.
   * @returns A list of memberships, with the respective group included.
   */
  getPlayerGroups(username: string, pagination?: PaginationOptions) {
    return this.getRequest<MembershipWithGroup[]>(`/players/${username}/groups`, pagination);
  }

  /**
   * Fetches a player's gains, for a specific period or time range, as a [metric: data] map.
   * @returns A map of each metric's gained data.
   */
  getPlayerGains(username: string, options: TimeRangeFilter) {
    return this.getRequest<GetPlayerGainsResponse<PlayerDeltasMap>>(`/players/${username}/gained`, options);
  }

  /**
   * Fetches a player's gains, for a specific period or time range, as an array.
   * @returns An array of each metric's gained data.
   */
  getPlayerGainsAsArray(username: string, options: TimeRangeFilter) {
    return this.getRequest<GetPlayerGainsResponse<PlayerDeltasArray>>(`/players/${username}/gained`, {
      ...options,
      formatting: 'array'
    });
  }

  /**
   * Fetches all of the player's records.
   * @returns A list of records.
   */
  getPlayerRecords(username: string, options?: PlayerRecordsFilter) {
    return this.getRequest<Record[]>(`/players/${username}/records`, options);
  }

  /**
   * Fetches all of the player's past snapshots.
   * @returns A list of snapshots.
   */
  getPlayerSnapshots(username: string, options?: TimeRangeFilter) {
    return this.getRequest<FormattedSnapshot[]>(`/players/${username}/snapshots`, options);
  }

  /**
   * Fetches all of the player's past snapshots' timeline.
   * @returns A list of timeseries data (value, date)
   */
  getPlayerSnapshotTimeline(username: string, metric: Metric, options?: TimeRangeFilter) {
    return this.getRequest<{ value: number; date: Date }[]>(`/players/${username}/snapshots/timeline`, {
      ...options,
      metric
    });
  }

  /**
   * Fetches all of the player's approved name changes.
   * @returns A list of name changes.
   */
  getPlayerNames(username: string) {
    return this.getRequest<NameChange[]>(`/players/${username}/names`);
  }
}
