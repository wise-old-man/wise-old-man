import env from 'env';

const config = {
  redis: {
    host: env.REDIS_HOST,
    port: parseInt(env.REDIS_PORT),
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  }
};

export default config;
