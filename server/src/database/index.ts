import { Sequelize } from 'sequelize-typescript';
import env from '../env';
import {
  Achievement,
  Competition,
  Delta,
  Group,
  Membership,
  NameChange,
  Participation,
  Player,
  Record,
  Snapshot
} from '../database/models';

const models = [
  Achievement,
  Competition,
  Group,
  Membership,
  Participation,
  Player,
  Record,
  Snapshot,
  NameChange,
  Delta
];

const CPU_COUNT = env.CPU_COUNT ? parseInt(env.CPU_COUNT) : 1;

const sequelize = new Sequelize({
  dialect: 'postgres',
  models,
  database: process.env.CORE_DATABASE,
  host: env.DB_HOST,
  port: parseInt(env.POSTGRES_PORT),
  username: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  logging: false,
  pool: {
    max: Math.round(40 / CPU_COUNT),
    min: Math.round(5 / CPU_COUNT),
    acquire: 30000,
    idle: 10000
  },
  retry: { max: 5 }
});

export { sequelize };
