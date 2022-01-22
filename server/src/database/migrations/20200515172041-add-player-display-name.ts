import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.addColumn('players', 'displayName', {
    type: dataTypes.STRING(20)
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('players', 'displayName');
}

export { up, down };
