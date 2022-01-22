import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.addColumn('players', 'country', {
    type: dataTypes.STRING(3)
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('players', 'country');
}

export { up, down };
