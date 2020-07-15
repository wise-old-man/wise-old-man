import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface): Promise<void> {
  return queryInterface.addIndex('players', ['type'], {
    name: 'players_type'
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeIndex('players', '`players_type`');
}

export { up, down };
