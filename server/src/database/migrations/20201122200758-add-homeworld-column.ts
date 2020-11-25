import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.addColumn('groups', 'homeworld', {
    type: dataTypes.INTEGER
  });
}

function down(queryInterface: QueryInterface): Promise<void> {
  return queryInterface.removeColumn('groups', 'homeworld');
}

export { up, down };
