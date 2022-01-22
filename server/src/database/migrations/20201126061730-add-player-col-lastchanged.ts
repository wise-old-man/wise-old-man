import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.addColumn('players', 'lastChangedAt', {
    type: dataTypes.DATE
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('players', 'lastChangedAt');
}

export { up, down };
