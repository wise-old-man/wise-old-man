import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.addColumn('groups', 'homeworld', {
    type: dataTypes.INTEGER
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('groups', 'homeworld');
}

export { up, down };
