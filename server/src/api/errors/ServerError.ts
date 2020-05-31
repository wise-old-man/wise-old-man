class ServerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ServerError';
    this.statusCode = 500;
  }
}

export default ServerError;
