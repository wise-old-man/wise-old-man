import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface): Promise<void> {
  return queryInterface.addIndex('snapshots', ['createdAt'], {
    name: 'snapshots_createdAt'
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeIndex('snapshots', '`snapshots_createdAt`');
}

export { up, down };
