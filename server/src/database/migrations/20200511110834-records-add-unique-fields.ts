import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface) {
  return queryInterface.addIndex('records', ['playerId', 'period', 'metric'], {
    name: 'records_playerId_period_metric',
    unique: true
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeIndex('records', '`records_playerId_period_metric`');
}

export { up, down };
