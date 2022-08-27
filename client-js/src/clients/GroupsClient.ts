import {
  CompetitionListItem,
  ExtendedAchievement,
  GroupListItem,
  GroupWithMemberships,
  MembershipWithPlayer,
  Metric,
  GroupHiscoresEntry,
  NameChange,
  GroupStatistics,
  RecordLeaderboardEntry,
  DeltaLeaderboardEntry
} from '../../../server/src/utils';
import {
  PaginationOptions,
  sendDeleteRequest,
  sendGetRequest,
  sendPostRequest,
  sendPutRequest
} from '../utils';
import type {
  CreateGroupPayload,
  GenericCountMessageResponse,
  GenericMessageResponse,
  CreateGroupResponse,
  EditGroupPayload,
  ChangeMemberRolePayload,
  GetGroupGainsFilter,
  GroupMemberFragment,
  GroupRecordsFilter
} from '../api-types';

export default class GroupsClient {
  /**
   * Searches for groups that match a partial name.
   * @returns A list of groups.
   */
  searchGroups(name: string, pagination?: PaginationOptions) {
    return sendGetRequest<GroupListItem[]>('/groups', { name, ...pagination });
  }

  /**
   * Fetches a group's details.
   * @returns A group details object.
   */
  getGroupDetails(id: number) {
    return sendGetRequest<GroupListItem>(`/groups/${id}`);
  }

  /**
   * Fetches a group's entire members list.
   * @returns A list of memberships, with players included.
   */
  getGroupMembers(id: number) {
    return sendGetRequest<MembershipWithPlayer[]>(`/groups/${id}/members`);
  }

  /**
   * Creates a new group.
   * @returns The newly created group, and the verification code that authorizes future changes to it.
   */
  createGroup(payload: CreateGroupPayload) {
    return sendPostRequest<CreateGroupResponse>('/groups', payload);
  }

  /**
   * Edits an existing group.
   * @returns The updated group.
   */
  editGroup(id: number, payload: EditGroupPayload, verificationCode: string) {
    return sendPutRequest<GroupWithMemberships>(`/groups/${id}`, {
      ...payload,
      verificationCode
    });
  }

  /**
   * Deletes an existing group.
   * @returns A confirmation message.
   */
  deleteGroup(id: number, verificationCode: string) {
    return sendDeleteRequest<GenericMessageResponse>(`/groups/${id}`, { verificationCode });
  }

  /**
   * Adds all (valid) given usernames (and roles) to a group, ignoring duplicates.
   * @returns The number of members added and a confirmation message.
   */
  addMembers(id: number, members: GroupMemberFragment[], verificationCode: string) {
    return sendPostRequest<GenericCountMessageResponse>(`/groups/${id}/members`, {
      verificationCode,
      members
    });
  }

  /**
   * Remove all given usernames from a group, ignoring usernames that aren't members.
   * @returns The number of members removed and a confirmation message.
   */
  removeMembers(id: number, usernames: string[], verificationCode: string) {
    return sendDeleteRequest<GenericCountMessageResponse>(`/groups/${id}/members`, {
      verificationCode,
      members: usernames
    });
  }

  /**
   * Changes a player's role in a given group.
   * @returns The updated membership, with player included.
   */
  changeRole(id: number, payload: ChangeMemberRolePayload, verificationCode: string) {
    return sendPutRequest<MembershipWithPlayer>(`/groups/${id}/role`, {
      ...payload,
      verificationCode
    });
  }

  /**
   * Adds an "update" request to the queue, for each outdated group member.
   * @returns The number of players to be updated and a confirmation message.
   */
  updateAll(id: number, verificationCode: string) {
    return sendPostRequest<GenericCountMessageResponse>(`/groups/${id}/update-all`, {
      verificationCode
    });
  }

  /**
   * Fetches all of the groups's competitions
   * @returns A list of competitions.
   */
  getGroupCompetitions(id: number, pagination?: PaginationOptions) {
    return sendGetRequest<CompetitionListItem[]>(`/groups/${id}/competitions`, { ...pagination });
  }

  getGroupGains(id: number, filter: GetGroupGainsFilter, pagination?: PaginationOptions) {
    return sendGetRequest<DeltaLeaderboardEntry[]>(`/groups/${id}/gained`, { ...pagination, ...filter });
  }

  /**
   * Fetches a group members' latest achievements.
   * @returns A list of achievements.
   */
  getGroupAchievements(id: number, pagination?: PaginationOptions) {
    return sendGetRequest<ExtendedAchievement[]>(`/groups/${id}/achievements`, { ...pagination });
  }

  /**
   * Fetches a group's record leaderboard for a specific metric and period.
   * @returns A list of records, including their respective players.
   */
  getGroupRecords(id: number, filter: GroupRecordsFilter, pagination?: PaginationOptions) {
    return sendGetRequest<RecordLeaderboardEntry[]>(`/groups/${id}/records`, { ...pagination, ...filter });
  }

  /**
   * Fetches a group's hiscores for a specific metric.
   * @returns A list of hiscores entries (value, rank), including their respective players.
   */
  getGroupHiscores(id: number, metric: Metric, pagination?: PaginationOptions) {
    return sendGetRequest<GroupHiscoresEntry[]>(`/groups/${id}/hiscores`, { ...pagination, metric });
  }

  /**
   * Fetches a group members' latest name changes.
   * @returns A list of name change (approved) requests.
   */
  getGroupNameChanges(id: number, pagination?: PaginationOptions) {
    return sendGetRequest<NameChange[]>(`/groups/${id}/name-changes`, { ...pagination });
  }

  /**
   * Fetches a group's general statistics.
   * @returns An object with a few statistic values and an average stats snapshot.
   */
  getGroupStatistics(id: number) {
    return sendGetRequest<GroupStatistics>(`/groups/${id}/statistics`);
  }
}
