export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('participations', {
      playerId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'players',
          key: 'id'
        }
      },
      competitionId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'competitions',
          key: 'id'
        }
      },
      startSnapshotId: {
        type: Sequelize.INTEGER
      },
      endSnapshotId: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('participations');
  }
};
