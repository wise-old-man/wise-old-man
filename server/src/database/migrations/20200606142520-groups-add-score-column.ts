export = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('groups', 'score', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('groups', 'score');
  }
};
