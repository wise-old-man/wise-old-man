import env from '../../../env';

export default {
  host: env.REDIS_HOST,
  port: parseInt(env.REDIS_PORT),
  maxRetriesPerRequest: null,
  enableReadyCheck: false
};
