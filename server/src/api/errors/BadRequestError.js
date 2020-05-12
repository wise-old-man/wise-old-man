class BadRequestError extends Error {
  constructor(message, data) {
    super(message);
    this.name = 'BadRequestError';
    this.statusCode = 400;
    this.data = data;
  }
}

module.exports = BadRequestError;
