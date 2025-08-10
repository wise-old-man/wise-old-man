import { NameChangeResponse, NameChangeStatus } from '../api-types';
import { PaginationOptions } from '../utils';
import BaseAPIClient from './BaseAPIClient';

export default class NameChangesClient extends BaseAPIClient {
  /**
   * Searches for name changes that match a name and/or status filter.
   * @returns A list of name changes.
   */
  searchNameChanges(
    filter: {
      username?: string;
      status?: NameChangeStatus;
    },
    pagination?: PaginationOptions
  ) {
    return this.getRequest<NameChangeResponse[]>('/names', { ...filter, ...pagination });
  }

  /**
   * Submits a name change request between two usernames (old and new).
   * @returns A pending name change request, to be reviewed and resolved at a later date.
   */
  submitNameChange(oldName: string, newName: string) {
    return this.postRequest<NameChangeResponse>('/names', { oldName, newName });
  }
}
