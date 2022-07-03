import { QueryInterface } from 'sequelize/types';
import { PERIODS, METRICS } from '../../utils';

function up(queryInterface: QueryInterface, dataTypes: any) {
  return queryInterface.createTable('records', {
    id: {
      type: dataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    playerId: {
      type: dataTypes.INTEGER,
      allowNull: false,
      onDelete: 'CASCADE',
      references: {
        model: 'players',
        key: 'id'
      }
    },
    period: {
      type: dataTypes.ENUM(PERIODS),
      allowNull: false
    },
    metric: {
      type: dataTypes.ENUM(METRICS),
      allowNull: false
    },
    value: {
      type: dataTypes.BIGINT,
      defaultValue: 0
    },
    updatedAt: {
      type: dataTypes.DATE
    }
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.dropTable('records');
}

export { up, down };
