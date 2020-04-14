const { SKILLS } = require('../../api/constants/metrics');

function buildDynamicSchema(DataTypes) {
  const obj = {};

  SKILLS.forEach(s => {
    obj[`${s}Rank`] = DataTypes.INTEGER;
    obj[`${s}Experience`] = s === 'overall' ? DataTypes.BIGINT : DataTypes.INTEGER;
  });

  return obj;
}

module.exports = {
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
