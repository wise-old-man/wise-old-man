import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.addColumn('players', 'exp', {
    type: dataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  });
}

function down(queryInterface: QueryInterface): Promise<void> {
  return queryInterface.removeColumn('players', 'exp');
}

export { up, down };
