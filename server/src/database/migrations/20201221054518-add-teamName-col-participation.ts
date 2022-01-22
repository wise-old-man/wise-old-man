import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.addColumn('participations', 'teamName', {
    type: dataTypes.STRING(30)
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('participations', 'teamName');
}

export { up, down };
