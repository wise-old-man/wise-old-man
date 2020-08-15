class RateLimitError extends Error {
  message: string;
  name: string;
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
    this.statusCode = 429;
  }
}

export default RateLimitError;
