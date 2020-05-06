module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction(transaction =>
      Promise.all([
        queryInterface.addColumn(
          'players',
          'lastUpdatedAchievementsAt',
          {
            type: Sequelize.DATE
          },
          { transaction }
        ),
        queryInterface.bulkDelete('achievements', {}, { transaction })
      ])
    ),
  down: queryInterface =>
    queryInterface.sequelize.transaction(transaction =>
      Promise.all([
        queryInterface.removeColumn('players', 'lastUpdatedAchievementsAt', { transaction }),
        queryInterface.bulkDelete('achievements', {}, { transaction })
      ])
    )
};
