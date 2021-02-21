import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface): Promise<void> {
  return queryInterface.renameColumn('achievements', 'type', 'name');
}

function down(queryInterface: QueryInterface) {
  return queryInterface.renameColumn('achievements', 'name', 'type');
}

export { up, down };
