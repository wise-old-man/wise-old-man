import { handleError, transformDates } from '../utils';

export default class BaseAPIClient {
  private headers: HeadersInit;
  private baseUrl: string;

  constructor(headers: object, baseUrl: string) {
    this.baseUrl = baseUrl;
    this.headers = { Accept: 'application/json', 'Content-Type': 'application/json', ...headers };
  }

  private buildParams({ ...params }) {
    const builder = new URLSearchParams();

    Object.keys(params)
      .filter(k => params[k] !== undefined)
      .forEach(k => builder.set(k, params[k]));

    const query = builder.toString();
    return query ? `?${query}` : '';
  }

  private async fetch({
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

    return await fetch(this.baseUrl + path + query, req);
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
  }): Promise<T> {
    const res = await this.fetch({ method, path, body, params });
    const data = await res.json();

    if (res.ok) {
      return transformDates(data) as T;
    }

    handleError(res.status, path, data);
  }

  private async requestText({
    method,
    path,
    body,
    params
  }: {
    method: string;
    path: string;
    body?: unknown;
    params?: unknown;
  }): Promise<string> {
    const res = await this.fetch({ method, path, body, params });
    const text = await res.text();

    if (res.ok) {
      return text;
    }

    handleError(res.status, path, JSON.parse(text));
  }

  async postRequest<T>(path: string, body?: unknown) {
    return await this.request<T>({ method: 'POST', path, body: body || {} });
  }

  async putRequest<T>(path: string, body?: unknown) {
    return await this.request<T>({ method: 'PUT', path, body: body || {} });
  }

  async deleteRequest<T>(path: string, body?: unknown) {
    return await this.request<T>({ method: 'DELETE', path, body: body || {} });
  }

  async getRequest<T>(path: string, params?: unknown) {
    return await this.request<T>({ method: 'GET', path, params });
  }

  async getText(path: string, params?: unknown) {
    return await this.requestText({ method: 'GET', path, params });
  }
}
