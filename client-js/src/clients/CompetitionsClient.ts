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
import { PaginationOptions } from '../utils';
import BaseAPIClient from './BaseAPIClient';

export default class CompetitionsClient extends BaseAPIClient {
  /**
   * Searches for competitions that match a title, type, metric and status filter.
   * @returns A list of competitions.
   */
  searchCompetitions(filter: CompetitionsSearchFilter, pagination?: PaginationOptions) {
    return this.getRequest<CompetitionListItem[]>('/competitions', { ...filter, ...pagination });
  }

  /**
   * Fetches the competition's full details, including all the participants and their progress.
   * @returns A competition with a list of participants.
   */
  getCompetitionDetails(id: number, previewMetric?: Metric) {
    return this.getRequest<CompetitionDetails>(`/competitions/${id}`, { metric: previewMetric });
  }

  /**
   * Fetches all the values (exp, kc, etc) in chronological order within the bounds
   * of the competition, for the top 5 participants.
   * @returns A list of competition progress objects, including the player and their value history over time.
   */
  getCompetitionTopHistory(id: number, previewMetric?: Metric) {
    return this.getRequest<Top5ProgressResult>(`/competitions/${id}/top-history`, {
      metric: previewMetric
    });
  }

  /**
   * Creates a new competition.
   * @returns The newly created competition, and the verification code that authorizes future changes to it.
   */
  createCompetition(payload: CreateCompetitionPayload) {
    return this.postRequest<CreateCompetitionResponse>('/competitions', payload);
  }

  /**
   * Edits an existing competition.
   * @returns The updated competition.
   */
  editCompetition(id: number, payload: EditCompetitionPayload, verificationCode: string) {
    return this.putRequest<CompetitionWithParticipations>(`/competitions/${id}`, {
      ...payload,
      verificationCode
    });
  }

  /**
   * Deletes an existing competition.
   * @returns A confirmation message.
   */
  deleteCompetition(id: number, verificationCode: string) {
    return this.deleteRequest<GenericMessageResponse>(`/competitions/${id}`, { verificationCode });
  }

  /**
   * Adds all (valid) given participants to a competition, ignoring duplicates.
   * @returns The number of participants added and a confirmation message.
   */
  addParticipants(id: number, participants: string[], verificationCode: string) {
    return this.postRequest<GenericCountMessageResponse>(`/competitions/${id}/participants`, {
      verificationCode,
      participants
    });
  }

  /**
   * Remove all given usernames from a competition, ignoring usernames that aren't competing.
   * @returns The number of participants removed and a confirmation message.
   */
  removeParticipants(id: number, participants: string[], verificationCode: string) {
    return this.deleteRequest<GenericCountMessageResponse>(`/competitions/${id}/participants`, {
      verificationCode,
      participants
    });
  }

  /**
   * Adds all (valid) given teams to a team competition, ignoring duplicates.
   * @returns The number of participants added and a confirmation message.
   */
  addTeams(id: number, teams: Team[], verificationCode: string) {
    return this.postRequest<GenericCountMessageResponse>(`/competitions/${id}/teams`, {
      verificationCode,
      teams
    });
  }

  /**
   * Remove all given team names from a competition, ignoring names that don't exist.
   * @returns The number of participants removed and a confirmation message.
   */
  removeTeams(id: number, teamNames: string[], verificationCode: string) {
    return this.deleteRequest<GenericCountMessageResponse>(`/competitions/${id}/teams`, {
      verificationCode,
      teamNames
    });
  }

  /**
   * Adds an "update" request to the queue, for each outdated competition participant.
   * @returns The number of players to be updated and a confirmation message.
   */
  updateAll(id: number, verificationCode: string) {
    return this.postRequest<GenericCountMessageResponse>(`/competitions/${id}/update-all`, {
      verificationCode
    });
  }
}
