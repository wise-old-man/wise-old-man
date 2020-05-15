const { EHP, getRankKey, getValueKey } = require('../../api/constants/metrics');

function getEhpColumns(Sequelize) {
  return EHP.map(rate => [
    { name: getRankKey(rate), type: Sequelize.INTEGER },
    { name: getValueKey(rate), type: Sequelize.FLOAT }
  ]).flat();
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    const actions = Promise.all(
      getEhpColumns(Sequelize).map(({ name, type }) =>
        queryInterface.addColumn('snapshots', name, {
          type,
          defaultValue: -1,
          allowNull: false
        })
      )
    );

    return actions;
  },

  down: () => {
    /*

    const actions = Promise.all(
      getEhpColumns(Sequelize).map(({ name }) => queryInterface.removeColumn('snapshots', name))
    );

    return actions;
    */

    // This migration fails to undo on SQLite (used for integration test)
    // So this migration should remain "everlasting" until I figure out a solution.
    // This issue has been submitted to Sequelize's repo at:
    // https://github.com/sequelize/sequelize/issues/12229
    return new Promise(success => success([]));
  }
};
