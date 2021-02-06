import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface): Promise<void> {
  return queryInterface.removeColumn('deltas', 'indicator');
}

function down(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.addColumn('deltas', 'indicator', {
    type: dataTypes.STRING(20)
  });
}

export { up, down };
