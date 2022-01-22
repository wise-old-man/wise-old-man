import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface) {
  return queryInterface.addIndex('deltas', ['playerId', 'period'], {
    name: 'deltas_playerId_period',
    unique: true
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeIndex('deltas', '`deltas_playerId_period`');
}

export { up, down };
