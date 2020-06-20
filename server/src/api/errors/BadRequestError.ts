class BadRequestError extends Error {
  message: string;

  name: string;

  statusCode: number;

  data: any;

  constructor(message, data?) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
    this.data = data;
  }
}

export default BadRequestError;
