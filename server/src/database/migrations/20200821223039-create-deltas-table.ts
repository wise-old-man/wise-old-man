import { QueryInterface } from 'sequelize/types';
import { ACTIVITIES, BOSSES, SKILLS } from '../../api/constants';

function buildDynamicSchema(dataTypes: any) {
  const obj = {};

  [...SKILLS, ...BOSSES, ...ACTIVITIES].forEach(s => {
    obj[s] = s === 'overall' ? dataTypes.BIGINT : dataTypes.INTEGER;
  });

  return obj;
}

function up(queryInterface: QueryInterface, dataTypes: any): Promise<void> {
  return queryInterface.createTable('deltas', {
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
      type: dataTypes.STRING(20),
      allowNull: false
    },
    indicator: {
      type: dataTypes.STRING(20),
      allowNull: false
    },
    startedAt: {
      type: dataTypes.DATE,
      allowNull: false
    },
    endedAt: {
      type: dataTypes.DATE,
      allowNull: false
    },
    ...buildDynamicSchema(dataTypes),
    updatedAt: {
      type: dataTypes.DATE
    }
  });
}

function down(queryInterface: QueryInterface) {
  return queryInterface.dropTable('deltas');
}

export { up, down };
