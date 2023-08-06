import dayjs from 'dayjs';
import customParseFormatPlugin from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormatPlugin);

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

interface APIErrorData {
  message: string;
  data?: unknown;
}

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

export function transformDates(input: unknown) {
  return traverseTransform(input, val => (isValidISODate(val) ? new Date(val as string) : val));
}

export function handleError(status: number, path: string, data?: APIErrorData) {
  if (!data) return;

  if (status === 400) {
    throw new BadRequestError(path, data.message, data.data);
  }

  if (status === 403) {
    throw new ForbiddenError(path, data.message);
  }

  if (status === 404) {
    throw new NotFoundError(path, data.message);
  }

  if (status === 429) {
    throw new RateLimitError(path, data.message);
  }

  if (status === 500) {
    throw new InternalServerError(path, data.message);
  }
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
