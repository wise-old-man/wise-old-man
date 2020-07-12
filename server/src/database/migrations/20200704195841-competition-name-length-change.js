module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('competitions', 'title', {
      type: Sequelize.STRING(50),
      allowNull: false
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('competitions', 'title', {
      type: Sequelize.STRING(30),
      allowNull: false
    });
  }
};
