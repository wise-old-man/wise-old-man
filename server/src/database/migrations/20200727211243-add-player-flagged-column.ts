import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.addColumn('players', 'flagged', {
    type: dataTypes.BOOLEAN,
    defaultValue: false
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('players', 'flagged');
}

export { up, down };
