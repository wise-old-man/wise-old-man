import { QueryInterface } from 'sequelize/types';
import { ALL_METRICS } from 'api/constants';
import { getRankKey, getValueKey } from 'api/util/metrics';

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.createTable('initialValues', {
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
    ...buildDynamicSchema(dataTypes),
    updatedAt: {
      type: dataTypes.DATE
    }
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.dropTable('initialValues');
}

function buildDynamicSchema(DataTypes) {
  const obj = {};

  ALL_METRICS.forEach(s => {
    obj[getRankKey(s)] = DataTypes.INTEGER;
    obj[getValueKey(s)] = s === 'overall' ? DataTypes.BIGINT : DataTypes.INTEGER;
  });

  return obj;
}

export { up, down };
