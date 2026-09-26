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

  // Validate this input string is a ISO 8601 date
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(input);
}

export function transformDates(input: unknown) {
  return traverseTransform(input, val => (isValidISODate(val) ? new Date(val as string) : val));
}

export function handleError(status: number, path: string, data?: APIErrorData): never {
  // Error responses without a valid JSON body still throw, with a generic message.
  const message = data?.message ?? 'Unexpected error';

  switch (status) {
    case 400:
      throw new BadRequestError(path, message, data?.data);
    case 403:
      throw new ForbiddenError(path, message, data?.data);
    case 404:
      throw new NotFoundError(path, message);
    case 409:
      throw new ConflictError(path, message, data?.data);
    case 429:
      throw new RateLimitError(path, message);
    case 503:
      throw new ServiceUnavailableError(path, message);
    default:
      throw new InternalServerError(path, message);
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

class ConflictError extends Error {
  name: string;
  resource: string;
  statusCode: number;
  data?: unknown;

  constructor(resource: string, message: string, data?: unknown) {
    super(message);
    this.name = 'ConflictError';
    this.resource = resource;
    this.statusCode = 409;
    this.data = data;
  }
}

class ServiceUnavailableError extends Error {
  name: string;
  resource: string;
  statusCode: number;

  constructor(resource: string, message: string) {
    super(message);
    this.name = 'ServiceUnavailableError';
    this.resource = resource;
    this.statusCode = 503;
  }
}

class ForbiddenError extends Error {
  name: string;
  resource: string;
  statusCode: number;
  data?: unknown;

  constructor(resource: string, message: string, data?: unknown) {
    super(message);
    this.name = 'ForbiddenError';
    this.resource = resource;
    this.statusCode = 403;
    this.data = data;
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
