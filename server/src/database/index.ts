import { Sequelize } from 'sequelize-typescript';
import Achievement from '../api/modules/achievements/achievement.model';
import Competition from '../api/modules/competitions/competition.model';
import Participation from '../api/modules/competitions/participation.model';
import InitialValues from '../api/modules/deltas/initialValues.model';
import Group from '../api/modules/groups/group.model';
import Membership from '../api/modules/groups/membership.model';
import Player from '../api/modules/players/player.model';
import Record from '../api/modules/records/record.model';
import Snapshot from '../api/modules/snapshots/snapshot.model';
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
  Snapshot
];

const sequelize = new Sequelize({
  ...config,
  models,
  dialect: isTesting() ? 'sqlite' : 'postgres'
});

export {
  sequelize,
  Achievement,
  Competition,
  Group,
  InitialValues,
  Membership,
  Participation,
  Player,
  Record,
  Snapshot
};
