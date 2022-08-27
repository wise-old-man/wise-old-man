import {
  CompetitionListItem,
  ExtendedAchievement,
  GroupDelta,
  GroupListItem,
  GroupWithMemberships,
  MembershipWithPlayer,
  Metric,
  Record,
  GroupHiscoresEntry,
  NameChange,
  GroupStatistics
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
  searchGroups(name: string, pagination?: PaginationOptions) {
    return sendGetRequest<GroupListItem[]>('/groups', { name, ...pagination });
  }

  getGroupDetails(id: number) {
    return sendGetRequest<GroupListItem>(`/groups/${id}`);
  }

  getGroupMembers(id: number) {
    return sendGetRequest<MembershipWithPlayer[]>(`/groups/${id}/members`);
  }

  createGroup(payload: CreateGroupPayload) {
    return sendPostRequest<CreateGroupResponse>('/groups', payload);
  }

  editGroup(id: number, payload: EditGroupPayload, verificationCode: string) {
    return sendPutRequest<GroupWithMemberships>(`/groups/${id}`, {
      ...payload,
      verificationCode
    });
  }

  deleteGroup(id: number, verificationCode: string) {
    return sendDeleteRequest<GenericMessageResponse>(`/groups/${id}`, { verificationCode });
  }

  addMembers(id: number, members: GroupMemberFragment[], verificationCode: string) {
    return sendPostRequest<GenericCountMessageResponse>(`/groups/${id}/members`, {
      verificationCode,
      members
    });
  }

  removeMembers(id: number, usernames: string[], verificationCode: string) {
    return sendDeleteRequest<GenericCountMessageResponse>(`/groups/${id}/members`, {
      verificationCode,
      members: usernames
    });
  }

  changeRole(id: number, payload: ChangeMemberRolePayload, verificationCode: string) {
    return sendPutRequest<MembershipWithPlayer>(`/groups/${id}/role`, {
      ...payload,
      verificationCode
    });
  }

  updateAll(id: number, verificationCode: string) {
    return sendPostRequest<GenericCountMessageResponse>(`/groups/${id}/update-all`, {
      verificationCode
    });
  }

  getGroupCompetitions(id: number, pagination?: PaginationOptions) {
    return sendGetRequest<CompetitionListItem[]>(`/groups/${id}/competitions`, { ...pagination });
  }

  getGroupGains(id: number, filter: GetGroupGainsFilter, pagination?: PaginationOptions) {
    return sendGetRequest<GroupDelta[]>(`/groups/${id}/gained`, { ...pagination, ...filter });
  }

  getGroupAchievements(id: number, pagination?: PaginationOptions) {
    return sendGetRequest<ExtendedAchievement[]>(`/groups/${id}/achievements`, { ...pagination });
  }

  getGroupRecords(id: number, filter: GroupRecordsFilter, pagination?: PaginationOptions) {
    return sendGetRequest<Record[]>(`/groups/${id}/records`, { ...pagination, ...filter });
  }

  getGroupHiscores(id: number, metric: Metric, pagination?: PaginationOptions) {
    return sendGetRequest<GroupHiscoresEntry[]>(`/groups/${id}/hiscores`, { ...pagination, metric });
  }

  getGroupNameChanges(id: number, pagination?: PaginationOptions) {
    return sendGetRequest<NameChange[]>(`/groups/${id}/name-changes`, { ...pagination });
  }

  getGroupStatistics(id: number) {
    return sendGetRequest<GroupStatistics>(`/groups/${id}/statistics`);
  }
}
