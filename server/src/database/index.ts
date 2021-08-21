import { Sequelize } from 'sequelize-typescript';
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
import { isTesting } from '../env';
import config from './config';

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

const sequelize = new Sequelize({
  ...config,
  models,
  dialect: isTesting() ? 'sqlite' : 'postgres'
});

export { sequelize };
