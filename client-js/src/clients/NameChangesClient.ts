import type { NameChangesSearchFilter } from '../api-types';
import { NameChange, NameChangeDetails } from '../../../server/src/utils';
import { PaginationOptions, sendGetRequest, sendPostRequest } from '../utils';

export default class NameChangesClient {
  /**
   * Searches for name changes that match a name and/or status filter.
   * @returns A list of name changes.
   */
  searchNameChanges(filter: NameChangesSearchFilter, pagination?: PaginationOptions) {
    return sendGetRequest<NameChange[]>('/names', { ...filter, ...pagination });
  }

  /**
   * Submits a name change request between two usernames (old and new).
   * @returns A pending name change request, to be reviewed and resolved at a later date.
   */
  submitNameChange(oldName: string, newName: string) {
    return sendPostRequest<NameChange>('/names', { oldName, newName });
  }

  /**
   * Gets details on a specific name change request.
   * @returns The name change request's details, which includes all data required to review.
   */
  getNameChangeDetails(id: number) {
    return sendGetRequest<NameChangeDetails>(`/names/${id}`);
  }
}
