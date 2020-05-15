const { ALL_METRICS, getRankKey, getValueKey } = require('../../api/constants/metrics');

function buildDynamicSchema(DataTypes) {
  const obj = {};

  ALL_METRICS.forEach(s => {
    obj[getRankKey(s)] = DataTypes.INTEGER;
    obj[getValueKey(s)] = determineType(s, DataTypes);
  });

  return obj;
}

function determineType(name, DataTypes) {
  switch (name) {
    case 'overall':
      return DataTypes.BIGINT;
    case 'ehp':
    case 'lehp':
    case 'sehp':
    case 'lsehp':
      return DataTypes.FLOAT;
    default:
      return DataTypes.INTEGER;
  }
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
