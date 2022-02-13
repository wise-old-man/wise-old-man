import env, { isTesting } from '../env';

const CPU_COUNT = env.CPU_COUNT ? parseInt(env.CPU_COUNT) : 1;

export = {
  database: 'wise-old-man',
  dialect: isTesting() ? 'sqlite' : 'postgres',
  host: env.DB_HOST,
  username: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  storage: env.DB_STORAGE,
  logging: false,
  pool: {
    max: Math.round(40 / CPU_COUNT),
    min: Math.round(5 / CPU_COUNT),
    acquire: 30000,
    idle: 10000
  },
  retry: {
    max: 5
  }
};
