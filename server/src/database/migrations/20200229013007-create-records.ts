import { QueryInterface } from 'sequelize/types';
import { PERIODS } from '@wise-old-man/utils';
import { ALL_METRICS } from '../../api/constants';

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
