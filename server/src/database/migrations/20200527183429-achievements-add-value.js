module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('achievements', 'value', {
      type: Sequelize.BIGINT
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('achievements', 'value');
  }
};
