import { Sequelize } from 'sequelize-typescript';
import env from '../env';
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
  switch (env.DB_DIALECT) {
    case 'sqlite':
      return 'sqlite';
    default:
      return 'postgres';
  }
}

export { sequelize };
