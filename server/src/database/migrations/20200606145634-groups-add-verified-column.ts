export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('groups', 'verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('groups', 'verified');
  }
};
