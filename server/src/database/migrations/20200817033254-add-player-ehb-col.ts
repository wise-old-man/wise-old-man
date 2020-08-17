import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.addColumn('players', 'ehb', {
    type: dataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  });
}

function down(queryInterface: QueryInterface): Promise<void> {
  return queryInterface.removeColumn('players', 'ehb');
}

export { up, down };
