import {
  AchievementProgressResponse,
  AchievementResponse,
  CompetitionResponse,
  CompetitionStatus,
  GroupResponse,
  MembershipResponse,
  Metric,
  NameChangeResponse,
  ParticipationResponse,
  Period,
  PlayerArchiveResponse,
  PlayerCompetitionStandingResponse,
  PlayerDeltasMapResponse,
  PlayerDetailsResponse,
  PlayerResponse,
  RecordResponse,
  SnapshotResponse,
  TimeRangeFilter
} from '../api-types';
import { PaginationOptions } from '../utils';
import BaseAPIClient from './BaseAPIClient';

export default class PlayersClient extends BaseAPIClient {
  /**
   * Searches players by partial username.
   * @returns A list of players.
   */
  searchPlayers(partialUsername: string, pagination?: PaginationOptions) {
    return this.getRequest<PlayerResponse[]>('/players/search', { username: partialUsername, ...pagination });
  }

  /**
   * Updates/tracks a player.
   * @returns The player's new details, including the latest snapshot.
   */
  updatePlayer(username: string) {
    return this.postRequest<PlayerDetailsResponse>(`/players/${username}`);
  }

  /**
   * Asserts (and attempts to fix, if necessary) a player's game-mode type.
   * @returns The updated player, and an indication of whether the type was changed.
   */
  assertPlayerType(username: string) {
    return this.postRequest<{ player: PlayerResponse; changed: boolean }>(`/players/${username}/assert-type`);
  }

  /**
   * Fetches a player's details.
   * @returns The player's details, including the latest snapshot.
   */
  getPlayerDetails(username: string) {
    return this.getRequest<PlayerDetailsResponse>(`/players/${username}`);
  }

  /**
   * Fetches a player's details by ID.
   * @returns The player's details, including the latest snapshot.
   */
  getPlayerDetailsById(id: number) {
    return this.getRequest<PlayerDetailsResponse>(`/players/id/${id}`);
  }

  /**
   * Fetches a player's current achievements.
   * @returns A list of achievements.
   */
  getPlayerAchievements(username: string) {
    return this.getRequest<AchievementResponse[]>(`/players/${username}/achievements`);
  }

  /**
   * Fetches a player's current achievement progress.
   * @returns A list of achievements (completed or otherwise), with their respective relative/absolute progress percentage.
   */
  getPlayerAchievementProgress(username: string) {
    return this.getRequest<AchievementProgressResponse[]>(`/players/${username}/achievements/progress`);
  }

  /**
   * Fetches all of the player's competition participations.
   * @returns A list of participations, with the respective competition included.
   */
  getPlayerCompetitions(
    username: string,
    filter?: {
      status?: CompetitionStatus;
    },
    pagination?: PaginationOptions
  ) {
    return this.getRequest<Array<ParticipationResponse & { competition: CompetitionResponse }>>(
      `/players/${username}/competitions`,
      {
        ...filter,
        ...pagination
      }
    );
  }

  /**
   * Fetches all of the player's competition participations' standings.
   * @returns A list of participations, with the respective competition, rank and progress included.
   */
  getPlayerCompetitionStandings(
    username: string,
    filter: {
      status?: CompetitionStatus;
    }
  ) {
    return this.getRequest<PlayerCompetitionStandingResponse[]>(
      `/players/${username}/competitions/standings`,
      filter
    );
  }

  /**
   * Fetches all of the player's group memberships.
   * @returns A list of memberships, with the respective group included.
   */
  getPlayerGroups(username: string, pagination?: PaginationOptions) {
    return this.getRequest<Array<MembershipResponse & { group: GroupResponse }>>(
      `/players/${username}/groups`,
      pagination
    );
  }

  /**
   * Fetches a player's gains, for a specific period or time range, as a [metric: data] map.
   * @returns A map of each metric's gained data.
   */
  getPlayerGains(username: string, options: TimeRangeFilter) {
    return this.getRequest<{ startsAt: Date | null; endsAt: Date | null; data: PlayerDeltasMapResponse }>(
      `/players/${username}/gained`,
      options
    );
  }

  /**
   * Fetches all of the player's records.
   * @returns A list of records.
   */
  getPlayerRecords(
    username: string,
    options?: {
      period: Period | string;
      metric: Metric;
    }
  ) {
    return this.getRequest<RecordResponse[]>(`/players/${username}/records`, options);
  }

  /**
   * Fetches all of the player's past snapshots.
   * @returns A list of snapshots.
   */
  getPlayerSnapshots(username: string, filter: TimeRangeFilter, pagination?: PaginationOptions) {
    return this.getRequest<SnapshotResponse[]>(`/players/${username}/snapshots`, {
      ...filter,
      ...pagination
    });
  }

  /**
   * Fetches all of the player's past snapshots' timeline.
   * @returns A list of timeseries data (value, rank, date)
   */
  getPlayerSnapshotTimeline(username: string, metric: Metric, options?: TimeRangeFilter) {
    return this.getRequest<{ value: number; rank: number; date: Date }[]>(
      `/players/${username}/snapshots/timeline`,
      { ...options, metric }
    );
  }

  /**
   * Fetches all of the player's approved name changes.
   * @returns A list of name changes.
   */
  getPlayerNames(username: string) {
    return this.getRequest<NameChangeResponse[]>(`/players/${username}/names`);
  }

  /**
   * Fetches all of archived players that previously held this username.
   * @returns A list of player archives.
   */
  getPlayerArchives(username: string) {
    return this.getRequest<Array<PlayerArchiveResponse & { player: PlayerResponse }>>(
      `/players/${username}/archives`
    );
  }
}
