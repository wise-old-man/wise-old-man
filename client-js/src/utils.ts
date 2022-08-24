import axios, { AxiosError } from 'axios';
import dayjs from 'dayjs';
import customParseFormaPlugin from 'dayjs/plugin/customParseFormat';
import config from './config';

dayjs.extend(customParseFormaPlugin);

function traverseTransform(input: unknown, transformation: (i: unknown) => unknown): unknown {
  if (Array.isArray(input)) {
    return input.map(item => traverseTransform(item, transformation));
  }

  if (input !== null && typeof input === 'object') {
    return Object.fromEntries(
      Object.keys(input).map(key => [key, traverseTransform(input[key], transformation)])
    );
  }

  return transformation(input);
}

function isValidISODate(input: unknown) {
  if (!input || typeof input !== 'string') return false;

  // DayJS has a bug with strict parsing with timezones https://github.com/iamkun/dayjs/issues/929
  // So I'll just strip the "Z" timezone
  return input.endsWith('Z') && dayjs(input.slice(0, -1), 'YYYY-MM-DDTHH:mm:ss.SSS', true).isValid();
}

function transformDates(input: unknown) {
  return traverseTransform(input, val => (isValidISODate(val) ? new Date(val as string) : val));
}

export type PaginationOptions = Partial<{
  limit: number;
  offset: number;
}>;

function handleError(requestURL: string, e: AxiosError) {
  if (!e.response?.data) return;

  const data = e.response.data as APIErrorData;

  if (e.response.status === 400) {
    throw new BadRequestError(requestURL, data.message, data.data);
  }

  if (e.response.status === 403) {
    throw new ForbiddenError(requestURL, data.message);
  }

  if (e.response.status === 404) {
    throw new NotFoundError(requestURL, data.message);
  }

  if (e.response.status === 429) {
    throw new RateLimitError(requestURL, data.message);
  }

  if (e.response.status === 500) {
    throw new InternalServerError(requestURL, data.message);
  }
}

export async function sendPostRequest<T>(path: string, body?: unknown) {
  const requestURL = `${config.apiBaseUrl}${path}`;

  return axios
    .post(requestURL, body || {})
    .then(response => transformDates(response.data) as T)
    .catch(e => {
      if (axios.isAxiosError(e)) handleError(requestURL, e);
      throw e;
    });
}

export async function sendGetRequest<T>(path: string, params?: unknown) {
  const requestURL = `${config.apiBaseUrl}${path}`;

  return axios
    .get(requestURL, { params })
    .then(response => transformDates(response.data) as T)
    .catch(e => {
      if (axios.isAxiosError(e)) handleError(requestURL, e);
      throw e;
    });
}

interface APIErrorData {
  message: string;
  data?: unknown;
}

class BadRequestError extends Error {
  name: string;
  resource: string;
  statusCode: number;
  data?: unknown;

  constructor(resource: string, message: string, data?: unknown) {
    super(message);
    this.name = 'BadRequestError';
    this.resource = resource;
    this.statusCode = 400;
    this.data = data;
  }
}

class ForbiddenError extends Error {
  name: string;
  resource: string;
  statusCode: number;

  constructor(resource: string, message: string) {
    super(message);
    this.name = 'ForbiddenError';
    this.resource = resource;
    this.statusCode = 403;
  }
}

class NotFoundError extends Error {
  name: string;
  resource: string;
  statusCode: number;

  constructor(resource: string, message: string) {
    super(message);
    this.name = 'NotFoundError';
    this.resource = resource;
    this.statusCode = 404;
  }
}

class RateLimitError extends Error {
  name: string;
  resource: string;
  statusCode: number;

  constructor(resource: string, message: string) {
    super(message);
    this.name = 'RateLimitError';
    this.resource = resource;
    this.statusCode = 429;
  }
}

class InternalServerError extends Error {
  name: string;
  resource: string;
  statusCode: number;

  constructor(resource: string, message: string) {
    super(message);
    this.name = 'InternalServerError';
    this.resource = resource;
    this.statusCode = 500;
  }
}
