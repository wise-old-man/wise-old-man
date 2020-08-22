import { Sequelize } from 'sequelize-typescript';
import {
  Achievement,
  Competition,
  Delta,
  Group,
  InitialValues,
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
  InitialValues,
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
