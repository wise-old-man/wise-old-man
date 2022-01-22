import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.addColumn('groups', 'verified', {
    type: dataTypes.BOOLEAN,
    defaultValue: false
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('groups', 'verified');
}

export { up, down };
