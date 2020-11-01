import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.addColumn('players', 'leagueTier', {
    type: dataTypes.STRING,
    allowNull: false,
    defaultValue: 'bronze'
  });
}

function down(queryInterface: QueryInterface): Promise<void> {
  return queryInterface.removeColumn('players', 'leagueTier');
}

export { up, down };
