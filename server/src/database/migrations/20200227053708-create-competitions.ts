export = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('competitions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING(30),
        allowNull: false
      },
      metric: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      verificationHash: {
        type: Sequelize.STRING,
        allowNull: false
      },
      startsAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endsAt: {
        type: Sequelize.DATE,
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
    return queryInterface.dropTable('competitions');
  }
};
