import { transformDates, handleError } from '../utils';

export default class HttpClient {
  private headers: HeadersInit;
  private baseUrl: string;

  constructor(headers: object, baseUrl: string) {
    this.baseUrl = baseUrl;
    this.headers = { Accept: 'application/json', 'Content-Type': 'application/json', ...headers };
  }

  private buildParams({ ...params }) {
    const query = Object.keys(params)
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&');

    return `?${query}`;
  }

  private async request<T>({
    method,
    path,
    body,
    params
  }: {
    method: string;
    path: string;
    body?: unknown;
    params?: unknown;
  }) {
    const req = { method, body: undefined, headers: this.headers };
    let query = '';

    if (body) {
      req.body = JSON.stringify(body);
    }

    if (params) {
      query = this.buildParams(params);
    }

    const res = await fetch(this.baseUrl + path + query, req);
    const data = await res.json();

    if (res?.ok) {
      return transformDates(data) as T;
    }

    handleError(res.status, path, data);
  }

  async postRequest<T>(path: string, body?: unknown) {
    return await this.request<T>({ method: 'POST', path, body: body || {} });
  }

  async putRequest<T>(path: string, body?: unknown) {
    return await this.request<T>({ method: 'PUT', path, body: body || {} });
  }

  async deleteRequest<T>(path: string, body?: unknown) {
    return await this.request<T>({ method: 'DELETE', path, body: { data: body } });
  }

  async getRequest<T>(path: string, params?: unknown) {
    return await this.request<T>({ method: 'GET', path, params });
  }
}
