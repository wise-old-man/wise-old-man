export = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('achievements', 'threshold', {
      type: Sequelize.BIGINT
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('achievements', 'threshold');
  }
};
