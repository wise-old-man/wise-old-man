import { roles } from '../../api/constants/roles';

export = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('memberships', {
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
      groupId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'groups',
          key: 'id'
        }
      },
      role: {
        type: Sequelize.ENUM(roles),
        allowNull: false
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
    return queryInterface.dropTable('memberships');
  }
};
