import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.addColumn('deltas', 'nex', {
    type: dataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('deltas', 'nex');
}

export { up, down };
