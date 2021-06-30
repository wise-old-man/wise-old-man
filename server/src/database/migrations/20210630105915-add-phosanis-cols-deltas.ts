import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.addColumn('deltas', 'phosanis_nightmare', {
    type: dataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('deltas', 'phosanis_nightmare');
}

export { up, down };
