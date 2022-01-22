import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.addColumn('groups', 'clanChat', {
    type: dataTypes.STRING(20)
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('groups', 'clanChat');
}

export { up, down };
