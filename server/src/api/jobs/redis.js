module.exports = {
  redis: {
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
    port: process.env.REDIS_PORT,
    maxRetriesPerRequest: null,
    enableReadyCheck: false
  }
};
