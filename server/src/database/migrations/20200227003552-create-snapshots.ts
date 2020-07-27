import { QueryInterface } from 'sequelize/types';
import { SKILLS } from '../../api/constants';
import { getRankKey, getValueKey } from '../../api/util/metrics';

function buildDynamicSchema(DataTypes: any) {
  const obj = {};

  SKILLS.forEach(s => {
    obj[getRankKey(s)] = DataTypes.INTEGER;
    obj[getValueKey(s)] = s === 'overall' ? DataTypes.BIGINT : DataTypes.INTEGER;
  });

  return obj;
}

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.createTable('snapshots', {
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
    importedAt: {
      type: dataTypes.DATE
    },
    ...buildDynamicSchema(dataTypes),
    createdAt: {
      type: dataTypes.DATE
    }
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.dropTable('snapshots');
}

export { up, down };
