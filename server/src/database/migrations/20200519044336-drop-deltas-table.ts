import { periods } from '../../api/constants/periods';

export default {
  up: queryInterface => {
    return queryInterface.dropTable('deltas');
  },

  down: (queryInterface, Sequelize) => {
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
        type: Sequelize.ENUM(periods),
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
  }
};
