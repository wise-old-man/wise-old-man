import env, { isTesting } from '../env';

export = {
  database: 'shattered',
  dialect: isTesting() ? 'sqlite' : 'postgres',
  host: env.DB_HOST,
  username: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  storage: env.DB_STORAGE,
  logging: false,
  pool: { max: 100, min: 2, acquire: 20000, idle: 5000 },
  retry: { max: 10 }
};
