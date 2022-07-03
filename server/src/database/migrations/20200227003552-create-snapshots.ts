import { QueryInterface } from 'sequelize/types';
import { getMetricRankKey, getMetricValueKey, Metric } from '../../utils';

const SKILLS = [
  'overall',
  'attack',
  'defence',
  'strength',
  'hitpoints',
  'ranged',
  'prayer',
  'magic',
  'cooking',
  'woodcutting',
  'fletching',
  'fishing',
  'firemaking',
  'crafting',
  'smithing',
  'mining',
  'herblore',
  'agility',
  'thieving',
  'slayer',
  'farming',
  'runecrafting',
  'hunter',
  'construction'
];

function buildDynamicSchema(DataTypes: any) {
  const obj = {};

  SKILLS.forEach(s => {
    obj[getMetricRankKey(s as Metric)] = DataTypes.INTEGER;
    obj[getMetricValueKey(s as Metric)] = s === 'overall' ? DataTypes.BIGINT : DataTypes.INTEGER;
  });

  return obj;
}

function up(queryInterface: QueryInterface, dataTypes: any) {
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
