module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('competitions', 'updatedAllAt', {
      type: Sequelize.DATE
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('competitions', 'updatedAllAt');
  }
};
