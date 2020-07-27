import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface): Promise<void> {
  return queryInterface.addIndex('achievements', ['playerId', 'type'], {
    name: 'achievements_playerId_type',
    unique: true
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeIndex('achievements', '`achievements_playerId_type`');
}

export { up, down };
