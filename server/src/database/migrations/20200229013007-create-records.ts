import { periods } from '../../api/constants/periods';
import { ALL_METRICS } from '../../api/constants/metrics';
import { QueryInterface } from 'sequelize/types';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
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
      type: dataTypes.ENUM(periods),
      allowNull: false
    },
    metric: {
      type: dataTypes.ENUM(ALL_METRICS),
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
