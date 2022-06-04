export class BadRequestError extends Error {
  message: string;
  name: string;
  statusCode: number;
  data: any;

  constructor(message: string, data?: any) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
    this.data = data;
  }
}

export class ForbiddenError extends Error {
  message: string;
  name: string;
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

export class NotFoundError extends Error {
  message: string;
  name: string;
  statusCode: number;

  constructor(message: string) {
    super(message);
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
    this.name = 'ServerError';
    this.statusCode = 500;
  }
}
