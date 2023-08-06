import HttpClient from './HttpClient';

export default class BaseAPIClient {
  constructor(protected http: HttpClient) {}
}
