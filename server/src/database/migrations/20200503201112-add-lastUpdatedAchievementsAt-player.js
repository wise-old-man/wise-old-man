module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('players', 'lastUpdatedAchievementsAt', {
      type: Sequelize.DATE
    }),
  down: queryInterface => queryInterface.removeColumn('players', 'lastUpdatedAchievementsAt')
};
