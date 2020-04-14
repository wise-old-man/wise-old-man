const PERIODS = require('../../api/constants/periods');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('deltas', {
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
      period: {
        type: Sequelize.ENUM(PERIODS),
        allowNull: false
      },
      startSnapshotId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'snapshots',
          key: 'id'
        }
      },
      endSnapshotId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'snapshots',
          key: 'id'
        }
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('deltas');
  }
};
