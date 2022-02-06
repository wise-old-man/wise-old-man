import env, { isTesting } from '../env';

export = {
  database: 'shattered',
  dialect: isTesting() ? 'sqlite' : 'postgres',
  host: env.DB_HOST,
  username: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  storage: env.DB_STORAGE,
  logging: false,
  pool: { max: 40, min: 5, acquire: 30000, idle: 10000 },
  retry: { max: 5 }
};
