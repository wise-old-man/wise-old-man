import type {
  GetNameChangeDetailsResponse,
  NameChangesFilter,
  SearchNameChangesResponse,
  SubmitNameChangeResponse
} from '../api-types';
import { PaginationOptions, sendGetRequest, sendPostRequest } from '../utils';

export default class NameChangesClient {
  searchNameChanges(filter: NameChangesFilter, pagination?: PaginationOptions) {
    return sendGetRequest<SearchNameChangesResponse>('/names', { ...filter, ...pagination });
  }

  submitNameChange(oldName: string, newName: string) {
    return sendPostRequest<SubmitNameChangeResponse>('/names', { oldName, newName });
  }

  getNameChangeDetails(id: number) {
    return sendGetRequest<GetNameChangeDetailsResponse>(`/names/${id}`);
  }
}
