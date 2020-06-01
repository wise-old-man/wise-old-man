class NotFoundError extends Error {
  message: string;
  name: string;
  statusCode: number;

  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export default NotFoundError;
