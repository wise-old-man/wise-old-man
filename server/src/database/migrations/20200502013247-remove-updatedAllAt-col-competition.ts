import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface): Promise<void> {
  return queryInterface.removeColumn('competitions', 'updatedAllAt');
}

function down(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.addColumn('competitions', 'updatedAllAt', {
    type: dataTypes.DATE
  });
}

export { up, down };
