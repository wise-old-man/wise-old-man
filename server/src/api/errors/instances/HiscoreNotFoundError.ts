class HiscoreNotFoundError extends Error {
  message: string;
  name: string;
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'HiscoreNotFound';
    this.statusCode = 404;
  }
}

export default HiscoreNotFoundError;
