import { QueryInterface } from 'sequelize/types';
import { ALL_METRICS, PERIODS } from 'api/constants';

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
      type: dataTypes.ENUM(PERIODS),
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
