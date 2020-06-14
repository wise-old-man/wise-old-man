import { SKILLS, getRankKey, getValueKey } from '../../api/constants/metrics';

function buildDynamicSchema(DataTypes) {
  const obj = {};

  SKILLS.forEach(s => {
    obj[getRankKey(s)] = DataTypes.INTEGER;
    obj[getValueKey(s)] = s === 'overall' ? DataTypes.BIGINT : DataTypes.INTEGER;
  });

  return obj;
}

export = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('snapshots', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      playerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'players',
          key: 'id'
        }
      },
      importedAt: {
        type: Sequelize.DATE
      },
      ...buildDynamicSchema(Sequelize),
      createdAt: {
        type: Sequelize.DATE
      }
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('snapshots');
  }
};
