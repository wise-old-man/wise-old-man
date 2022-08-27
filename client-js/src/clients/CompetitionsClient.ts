import {
  CompetitionDetails,
  CompetitionListItem,
  CompetitionWithParticipations,
  Metric,
  Team,
  Top5ProgressResult
} from '../../../server/src/utils';
import type {
  CompetitionsSearchFilter,
  EditCompetitionPayload,
  CreateCompetitionPayload,
  CreateCompetitionResponse,
  GenericCountMessageResponse,
  GenericMessageResponse
} from '../api-types';
import {
  PaginationOptions,
  sendDeleteRequest,
  sendGetRequest,
  sendPostRequest,
  sendPutRequest
} from '../utils';

export default class CompetitionsClient {
  searchCompetitions(filter: CompetitionsSearchFilter, pagination?: PaginationOptions) {
    return sendGetRequest<CompetitionListItem[]>('/competitions', { ...filter, ...pagination });
  }

  getCompetitionDetails(id: number, previewMetric?: Metric) {
    return sendGetRequest<CompetitionDetails>(`/competitions/${id}`, { metric: previewMetric });
  }

  getCompetitionTopHistory(id: number, previewMetric?: Metric) {
    return sendGetRequest<Top5ProgressResult>(`/competitions/${id}/top-history`, {
      metric: previewMetric
    });
  }

  createCompetition(payload: CreateCompetitionPayload) {
    return sendPostRequest<CreateCompetitionResponse>('/competitions', payload);
  }

  editCompetition(id: number, payload: EditCompetitionPayload, verificationCode: string) {
    return sendPutRequest<CompetitionWithParticipations>(`/competitions/${id}`, {
      ...payload,
      verificationCode
    });
  }

  deleteCompetition(id: number, verificationCode: string) {
    return sendDeleteRequest<GenericMessageResponse>(`/competitions/${id}`, { verificationCode });
  }

  addParticipants(id: number, participants: string[], verificationCode: string) {
    return sendPostRequest<GenericCountMessageResponse>(`/competitions/${id}/participants`, {
      verificationCode,
      participants
    });
  }

  removeParticipants(id: number, participants: string[], verificationCode: string) {
    return sendDeleteRequest<GenericCountMessageResponse>(`/competitions/${id}/participants`, {
      verificationCode,
      participants
    });
  }

  addTeams(id: number, teams: Team[], verificationCode: string) {
    return sendPostRequest<GenericCountMessageResponse>(`/competitions/${id}/teams`, {
      verificationCode,
      teams
    });
  }

  removeTeams(id: number, teamNames: string[], verificationCode: string) {
    return sendDeleteRequest<GenericCountMessageResponse>(`/competitions/${id}/teams`, {
      verificationCode,
      teamNames
    });
  }

  updateAll(id: number, verificationCode: string) {
    return sendPostRequest<GenericCountMessageResponse>(`/competitions/${id}/update-all`, {
      verificationCode
    });
  }
}
