const { ALL_METRICS, getRankKey, getValueKey } = require('../../api/constants/metrics');

function buildDynamicSchema(DataTypes) {
  const obj = {};

  ALL_METRICS.forEach(s => {
    obj[getRankKey(s)] = DataTypes.INTEGER;
    obj[getValueKey(s)] = s === 'overall' ? DataTypes.BIGINT : DataTypes.INTEGER;
  });

  return obj;
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('initialValues', {
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
      ...buildDynamicSchema(Sequelize),
      updatedAt: {
        type: Sequelize.DATE
      }
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('initialValues');
  }
};
