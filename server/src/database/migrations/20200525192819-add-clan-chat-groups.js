module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('groups', 'clanChat', {
      type: Sequelize.STRING(20)
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('groups', 'clanChat');
  }
};
