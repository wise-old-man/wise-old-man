import { Sequelize } from 'sequelize';
import CONFIG from './config';

const seq = new Sequelize(CONFIG.database, CONFIG.username, CONFIG.password, CONFIG as any);

// Import and define all models
const models = {
  Player: seq.import(`../api/modules/players/player.model`),
  Snapshot: seq.import(`../api/modules/snapshots/snapshot.model`),
  InitialValues: seq.import(`../api/modules/snapshots/initialValues.model`),
  Record: seq.import(`../api/modules/records/record.model`),
  Competition: seq.import(`../api/modules/competitions/competition.model`),
  Participation: seq.import(`../api/modules/competitions/participation.model`),
  Group: seq.import(`../api/modules/groups/group.model`),
  Membership: seq.import(`../api/modules/groups/membership.model`),
  Achievement: seq.import(`../api/modules/achievements/achievement.model`)
};

// Setup all model associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = { seq, ...models };