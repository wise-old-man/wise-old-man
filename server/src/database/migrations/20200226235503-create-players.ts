import { playerTypes } from '../../api/constants/playerTypes';

export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('players', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: Sequelize.STRING(20),
        unique: true,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM(playerTypes),
        defaultValue: playerTypes[0]
      },
      lastImportedAt: {
        type: Sequelize.DATE
      },
      registeredAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    });
  },

  down: queryInterface => {
    return queryInterface.dropTable('players');
  }
};
