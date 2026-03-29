import { JobHandler } from '../types/job-handler.type';

interface Payload {
  username: string;
  attempts?: number;
}

export const CheckPlayerRankedJobHandler: JobHandler<Payload> = {
  options: {
    rateLimiter: {
      max: 1,
      duration: 5_000
    }
  },

  generateUniqueJobId(payload) {
    return [payload.username, payload.attempts ?? 0].join('_');
  },

  async execute(_payload, _context) {}
};
