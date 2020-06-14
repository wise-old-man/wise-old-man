import { periods } from '../../api/constants/periods';
import { ALL_METRICS } from '../../api/constants/metrics';

export = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('records', {
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
      metric: {
        type: Sequelize.ENUM(ALL_METRICS),
        allowNull: false
      },
      value: {
        type: Sequelize.BIGINT,
        defaultValue: 0
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('records');
  }
};
