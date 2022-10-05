import axios, { AxiosInstance } from 'axios';
import { transformDates, handleError } from '../utils';

export default class BaseAPIClient {
  private axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
  }

  async postRequest<T>(path: string, body?: unknown) {
    return this.axiosInstance
      .post(path, body || {})
      .then(response => transformDates(response.data) as T)
      .catch(e => {
        if (axios.isAxiosError(e)) handleError(path, e);
        throw e;
      });
  }

  async putRequest<T>(path: string, body?: unknown) {
    return this.axiosInstance
      .put(path, body || {})
      .then(response => transformDates(response.data) as T)
      .catch(e => {
        if (axios.isAxiosError(e)) handleError(path, e);
        throw e;
      });
  }

  async deleteRequest<T>(path: string, body?: unknown) {
    return this.axiosInstance
      .delete(path, { data: body })
      .then(response => transformDates(response.data) as T)
      .catch(e => {
        if (axios.isAxiosError(e)) handleError(path, e);
        throw e;
      });
  }

  async getRequest<T>(path: string, params?: unknown) {
    return this.axiosInstance
      .get(path, { params })
      .then(response => transformDates(response.data) as T)
      .catch(e => {
        if (axios.isAxiosError(e)) handleError(path, e);
        throw e;
      });
  }
}
