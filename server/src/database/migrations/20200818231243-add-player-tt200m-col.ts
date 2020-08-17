import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.addColumn('players', 'tt200m', {
    type: dataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  });
}

function down(queryInterface: QueryInterface): Promise<void> {
  return queryInterface.removeColumn('players', 'tt200m');
}

export { up, down };
