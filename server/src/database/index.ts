import * as dotenv from 'dotenv';
import { Sequelize } from 'sequelize-typescript';
import {
  Achievement,
  Competition,
  Group,
  InitialValues,
  Membership,
  Participation,
  Player,
  Record,
  Snapshot
} from './models';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  storage: process.env.DB_STORAGE,
  dialect: getDialect(),
  logging: false,
  pool: { max: 40, min: 2, acquire: 20000, idle: 5000 },
  retry: { max: 10 }
});
sequelize.addModels([
  Achievement,
  Competition,
  Group,
  InitialValues,
  Membership,
  Participation,
  Player,
  Record,
  Snapshot
]);

function getDialect() {
  switch (process.env.DB_DIALECT) {
    case 'sqlite':
      return 'sqlite';
    default:
      return 'postgres';
  }
}

export { sequelize };
