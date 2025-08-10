import type {
  AchievementResponse,
  CompetitionResponse,
  CreateGroupPayload,
  EditGroupPayload,
  GenericCountMessageResponse,
  GenericMessageResponse,
  GroupDetailsResponse,
  GroupHiscoresEntryResponse,
  GroupResponse,
  GroupRole,
  GroupStatisticsResponse,
  MemberActivityResponse,
  MembershipResponse,
  Metric,
  MetricDelta,
  NameChangeResponse,
  Period,
  PlayerResponse,
  RecordResponse,
  TimeRangeFilter
} from '../api-types';
import { PaginationOptions } from '../utils';
import BaseAPIClient from './BaseAPIClient';

export default class GroupsClient extends BaseAPIClient {
  /**
   * Searches for groups that match a partial name.
   * @returns A list of groups.
   */
  searchGroups(name: string, pagination?: PaginationOptions) {
    return this.getRequest<GroupResponse[]>('/groups', { name, ...pagination });
  }

  /**
   * Fetches a group's details, including a list of membership objects.
   * @returns A group details object.
   */
  getGroupDetails(id: number) {
    return this.getRequest<GroupDetailsResponse>(`/groups/${id}`);
  }

  /**
   * Creates a new group.
   * @returns The newly created group, and the verification code that authorizes future changes to it.
   */
  createGroup(payload: CreateGroupPayload) {
    return this.postRequest<{ group: GroupDetailsResponse; verificationCode: string }>('/groups', payload);
  }

  /**
   * Edits an existing group.
   * @returns The updated group.
   */
  editGroup(id: number, payload: EditGroupPayload, verificationCode: string) {
    return this.putRequest<GroupDetailsResponse>(`/groups/${id}`, {
      ...payload,
      verificationCode
    });
  }

  /**
   * Deletes an existing group.
   * @returns A confirmation message.
   */
  deleteGroup(id: number, verificationCode: string) {
    return this.deleteRequest<GenericMessageResponse>(`/groups/${id}`, { verificationCode });
  }

  /**
   * Adds all (valid) given usernames (and roles) to a group, ignoring duplicates.
   * @returns The number of members added and a confirmation message.
   */
  addMembers(
    id: number,
    members: Array<{
      username: string;
      role?: GroupRole;
    }>,
    verificationCode: string
  ) {
    return this.postRequest<GenericCountMessageResponse>(`/groups/${id}/members`, {
      verificationCode,
      members
    });
  }

  /**
   * Remove all given usernames from a group, ignoring usernames that aren't members.
   * @returns The number of members removed and a confirmation message.
   */
  removeMembers(id: number, usernames: string[], verificationCode: string) {
    return this.deleteRequest<GenericCountMessageResponse>(`/groups/${id}/members`, {
      verificationCode,
      members: usernames
    });
  }

  /**
   * Changes a player's role in a given group.
   * @returns The updated membership, with player included.
   */
  changeRole(
    id: number,
    payload: {
      username: string;
      role: GroupRole;
    },
    verificationCode: string
  ) {
    return this.putRequest<MembershipResponse & { player: PlayerResponse }>(`/groups/${id}/role`, {
      ...payload,
      verificationCode
    });
  }

  /**
   * Adds an "update" request to the queue, for each outdated group member.
   * @returns The number of players to be updated and a confirmation message.
   */
  updateAll(id: number, verificationCode: string) {
    return this.postRequest<GenericCountMessageResponse>(`/groups/${id}/update-all`, {
      verificationCode
    });
  }

  /**
   * Fetches all of the groups's competitions
   * @returns A list of competitions.
   */
  getGroupCompetitions(id: number, pagination?: PaginationOptions) {
    return this.getRequest<CompetitionResponse[]>(`/groups/${id}/competitions`, { ...pagination });
  }

  getGroupGains(id: number, filter: TimeRangeFilter & { metric: Metric }, pagination?: PaginationOptions) {
    return this.getRequest<
      Array<{
        player: PlayerResponse;
        startDate: Date;
        endDate: Date;
        data: MetricDelta;
      }>
    >(`/groups/${id}/gained`, {
      ...pagination,
      ...filter
    });
  }

  /**
   * Fetches a group members' latest achievements.
   * @returns A list of achievements.
   */
  getGroupAchievements(id: number, pagination?: PaginationOptions) {
    return this.getRequest<Array<AchievementResponse & { player: PlayerResponse }>>(
      `/groups/${id}/achievements`,
      {
        ...pagination
      }
    );
  }

  /**
   * Fetches a group's record leaderboard for a specific metric and period.
   * @returns A list of records, including their respective players.
   */
  getGroupRecords(id: number, filter: { metric: Metric; period: Period }, pagination?: PaginationOptions) {
    return this.getRequest<Array<RecordResponse & { player: PlayerResponse }>>(`/groups/${id}/records`, {
      ...pagination,
      ...filter
    });
  }

  /**
   * Fetches a group's hiscores for a specific metric.
   * @returns A list of hiscores entries (value, rank), including their respective players.
   */
  getGroupHiscores(id: number, metric: Metric, pagination?: PaginationOptions) {
    return this.getRequest<Array<GroupHiscoresEntryResponse>>(`/groups/${id}/hiscores`, {
      ...pagination,
      metric
    });
  }

  /**
   * Fetches a group members' latest name changes.
   * @returns A list of name change (approved) requests.
   */
  getGroupNameChanges(id: number, pagination?: PaginationOptions) {
    return this.getRequest<Array<NameChangeResponse & { player: PlayerResponse }>>(
      `/groups/${id}/name-changes`,
      {
        ...pagination
      }
    );
  }

  /**
   * Fetches a group's general statistics.
   * @returns An object with a few statistic values and an average stats snapshot.
   */
  getGroupStatistics(id: number) {
    return this.getRequest<GroupStatisticsResponse>(`/groups/${id}/statistics`);
  }

  /**
   * Fetches a group's activity.
   * @returns A list of a group's (join, leave and role changed) activity.
   */
  getGroupActivity(id: number, pagination?: PaginationOptions) {
    return this.getRequest<Array<MemberActivityResponse & { player: PlayerResponse }>>(
      `/groups/${id}/activity`,
      { ...pagination }
    );
  }

  /**
   * Fetches the groups's member list in CSV format.
   * @returns A string containing the CSV content.
   */
  getMembersCSV(id: number) {
    return this.getText(`/groups/${id}/csv`);
  }
}
