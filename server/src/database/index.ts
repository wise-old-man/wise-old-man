import { Sequelize } from 'sequelize-typescript';
import { isTesting } from 'env';
import {
  Achievement,
  Competition,
  Group,
  InitialValues,
  Membership,
  NameChange,
  Participation,
  Player,
  Record,
  Snapshot
} from 'database/models';
import config from './config';

const models = [
  Achievement,
  Competition,
  Group,
  InitialValues,
  Membership,
  Participation,
  Player,
  Record,
  Snapshot,
  NameChange
];

const sequelize = new Sequelize({
  ...config,
  models,
  dialect: isTesting() ? 'sqlite' : 'postgres'
});

export { sequelize };
