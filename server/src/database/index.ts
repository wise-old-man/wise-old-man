import { Sequelize } from 'sequelize';
import CONFIG from './config';
import { createConnection, Connection } from "typeorm";

createConnection({
  type: 'postgres',
  host: CONFIG.host,
  username: CONFIG.username,
  password: CONFIG.password,
  database: CONFIG.database,
  entities: ['models/*.ts']
});

// const sequelize = new Sequelize(CONFIG.database, CONFIG.username, CONFIG.password, CONFIG as any);

// // Import and define all models
// const models = {
//   Player: sequelize.import(`../api/modules/players/player.model`),
//   Snapshot: sequelize.import(`../api/modules/snapshots/snapshot.model`),
//   InitialValues: sequelize.import(`../api/modules/snapshots/initialValues.model`),
//   Record: sequelize.import(`../api/modules/records/record.model`),
//   Competition: sequelize.import(`../api/modules/competitions/competition.model`),
//   Participation: sequelize.import(`../api/modules/competitions/participation.model`),
//   Group: sequelize.import(`../api/modules/groups/group.model`),
//   Membership: sequelize.import(`../api/modules/groups/membership.model`),
//   Achievement: sequelize.import(`../api/modules/achievements/achievement.model`)
// };

// // Setup all model associations
// Object.keys(models).forEach(modelName => {
//   if (models[modelName].associate) {
//     models[modelName].associate(models);
//   }
// });

// export default {
//   sequelize,
//   ...models
// }