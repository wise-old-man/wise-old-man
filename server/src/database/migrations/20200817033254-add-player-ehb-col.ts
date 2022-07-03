import { Metric } from '../../utils';
import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.addColumn('players', Metric.EHB, {
    type: dataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.removeColumn('players', Metric.EHB);
}

export { up, down };
