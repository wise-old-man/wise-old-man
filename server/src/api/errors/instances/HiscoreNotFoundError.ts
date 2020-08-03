class HiscoreNotFoundError extends Error {
  message: string;
  name: string;
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'HiscoreNotFoundError';
    this.statusCode = 404;
  }
}

export default HiscoreNotFoundError;
