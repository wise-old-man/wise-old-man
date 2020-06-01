import PLAYER_TYPES from '../../api/constants/playerTypes.json';

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
        type: Sequelize.ENUM(PLAYER_TYPES),
        defaultValue: PLAYER_TYPES[0]
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
