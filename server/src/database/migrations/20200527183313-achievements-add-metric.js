module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('achievements', 'metric', {
      type: Sequelize.STRING
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('achievements', 'metric');
  }
};
