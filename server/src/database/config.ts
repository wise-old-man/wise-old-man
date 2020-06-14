require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

export = {
  host: process.env.DB_HOST,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  storage: process.env.DB_STORAGE,
  dialect: 'postgres',
  logging: false,
  repositoryMode: true,
  pool: { max: 40, min: 2, acquire: 20000, idle: 5000 },
  retry: { max: 10 }
};
