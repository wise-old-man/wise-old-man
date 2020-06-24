import dotenv from 'dotenv';
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
import config from './config';
dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const sequelize = new Sequelize({
  host: config.host,
  username: config.username,
  password: config.password,
  database: config.database,
  storage: config.storage,
  dialect: getDialect(),
  logging: config.logging,
  pool: config.pool,
  retry: config.retry
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
