import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.addColumn('competitions', 'updatedAllAt', {
    type: dataTypes.DATE
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('competitions', 'updatedAllAt');
}

export { up, down };
