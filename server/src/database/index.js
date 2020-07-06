const { Sequelize } = require('sequelize');
const databaseConfig = require('./config');

const sequelize = new Sequelize({
  ...databaseConfig
});

// Import and define all models
const models = {
  Player: sequelize.import(`../api/modules/players/player.model`),
  Snapshot: sequelize.import(`../api/modules/snapshots/snapshot.model`),
  InitialValues: sequelize.import(`../api/modules/snapshots/initialValues.model`),
  Record: sequelize.import(`../api/modules/records/record.model`),
  Competition: sequelize.import(`../api/modules/competitions/competition.model`),
  Participation: sequelize.import(`../api/modules/competitions/participation.model`),
  Group: sequelize.import(`../api/modules/groups/group.model`),
  Membership: sequelize.import(`../api/modules/groups/membership.model`),
  Achievement: sequelize.import(`../api/modules/achievements/achievement.model`)
};

// Setup all model associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = { sequelize, ...models };
