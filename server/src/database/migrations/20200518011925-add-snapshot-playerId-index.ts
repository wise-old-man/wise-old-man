import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface): Promise<void> {
  return queryInterface.addIndex('snapshots', ['playerId'], {
    name: 'snapshots_playerId'
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeIndex('snapshots', '`snapshots_playerId`');
}

export { up, down };
