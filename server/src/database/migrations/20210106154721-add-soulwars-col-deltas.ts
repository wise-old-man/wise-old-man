import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.addColumn('deltas', 'soul_wars_zeal', {
    type: dataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('deltas', 'soul_wars_zeal');
}

export { up, down };
