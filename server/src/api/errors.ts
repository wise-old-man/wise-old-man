export class BadRequestError extends Error {
  message: string;
  name: string;
  statusCode: number;
  data: unknown;

  constructor(message: string, data?: unknown) {
    super(message);
    this.message = message;
    this.name = 'BadRequestError';
    this.statusCode = 400;
    this.data = data;
  }
}

export class ConflictRequestError extends Error {
  message: string;
  name: string;
  statusCode: number;
  data: unknown;

  constructor(message: string, data?: unknown) {
    super(message);
    this.message = message;
    this.name = 'ConflictRequestError';
    this.statusCode = 409;
    this.data = data;
  }
}

export class ForbiddenError extends Error {
  message: string;
  name: string;
  statusCode: number;
  data: unknown;

  constructor(message: string, data?: unknown) {
    super(message);
    this.message = message;
    this.name = 'ForbiddenError';
    this.statusCode = 403;
    this.data = data;
  }
}

export class NotFoundError extends Error {
  message: string;
  name: string;
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class RateLimitError extends Error {
  message: string;
  name: string;
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'RateLimitError';
    this.statusCode = 429;
  }
}

export class ServerError extends Error {
  message: string;
  name: string;
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'ServerError';
    this.statusCode = 500;
  }
}
