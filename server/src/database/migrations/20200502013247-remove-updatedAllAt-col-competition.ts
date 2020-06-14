export = {
  up: queryInterface => {
    return queryInterface.removeColumn('competitions', 'updatedAllAt');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('competitions', 'updatedAllAt', {
      type: Sequelize.DATE
    });
  }
};
