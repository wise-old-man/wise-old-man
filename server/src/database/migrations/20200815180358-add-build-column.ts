import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.addColumn('players', 'build', {
    type: dataTypes.STRING,
    allowNull: false,
    defaultValue: 'main'
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('players', 'build');
}

export { up, down };
