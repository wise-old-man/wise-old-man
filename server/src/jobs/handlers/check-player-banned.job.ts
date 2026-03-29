import { JobHandler } from '../types/job-handler.type';

interface Payload {
  username: string;
}

export const CheckPlayerBannedJobHandler: JobHandler<Payload> = {
  options: {
    rateLimiter: {
      max: 1,
      duration: 5000
    },
    backoff: {
      type: 'exponential',
      delay: 600_000
    }
  },

  generateUniqueJobId(payload) {
    return payload.username;
  },

  async execute(_payload) {}
};
