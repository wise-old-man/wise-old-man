module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('achievements', {
      playerId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        onDelete: 'CASCADE',
        references: {
          model: 'players',
          key: 'id',
        },
      },
      type: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
      },
    });
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('achievements');
  },
};
