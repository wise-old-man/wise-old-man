import type { NameChangesSearchFilter } from '../api-types';
import { NameChange, NameChangeDetails } from '../../../server/src/utils';
import { PaginationOptions, sendGetRequest, sendPostRequest } from '../utils';

export default class NameChangesClient {
  searchNameChanges(filter: NameChangesSearchFilter, pagination?: PaginationOptions) {
    return sendGetRequest<NameChange[]>('/names', { ...filter, ...pagination });
  }

  submitNameChange(oldName: string, newName: string) {
    return sendPostRequest<NameChange>('/names', { oldName, newName });
  }

  getNameChangeDetails(id: number) {
    return sendGetRequest<NameChangeDetails>(`/names/${id}`);
  }
}
