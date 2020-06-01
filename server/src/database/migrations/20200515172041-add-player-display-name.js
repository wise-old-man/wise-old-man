export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('players', 'displayName', {
      type: Sequelize.STRING(20)
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('players', 'displayName');
  }
};
