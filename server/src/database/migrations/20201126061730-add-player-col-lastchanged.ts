import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.addColumn('players', 'lastChangedAt', {
    type: dataTypes.DATE
  });
}

function down(queryInterface: QueryInterface): Promise<void> {
  return queryInterface.removeColumn('players', 'lastChangedAt');
}

export { up, down };
