class HiscoresNotFoundError extends Error {
  message: string;
  name: string;
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'HiscoresNotFoundError';
    this.statusCode = 404;
  }
}

export default HiscoresNotFoundError;
