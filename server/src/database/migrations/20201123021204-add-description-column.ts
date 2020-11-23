import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.addColumn('groups', 'description', {
    type: dataTypes.STRING(100)
  });
}

function down(queryInterface: QueryInterface): Promise<void> {
  return queryInterface.removeColumn('groups', 'description');
}

export { up, down };
