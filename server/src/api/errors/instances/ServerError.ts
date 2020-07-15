class ServerError extends Error {
  message: string;
  name: string;
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'ServerError';
    this.statusCode = 500;
  }
}

export default ServerError;
