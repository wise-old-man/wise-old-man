const { ACTIVITIES, BOSSES, getRankKey, getValueKey } = require('../../api/constants/metrics');

function getActivityColumns(Sequelize) {
  return ACTIVITIES.map(activity => [
    { name: getRankKey(activity), type: Sequelize.INTEGER },
    { name: getValueKey(activity), type: Sequelize.INTEGER }
  ]).flat();
}

function getBossColumns(Sequelize) {
  return BOSSES.map(boss => [
    { name: getRankKey(boss), type: Sequelize.INTEGER },
    { name: getValueKey(boss), type: Sequelize.INTEGER }
  ]).flat();
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    const newColumns = [...getActivityColumns(Sequelize), ...getBossColumns(Sequelize)];

    const actions = Promise.all(
      newColumns.map(({ name, type }) =>
        queryInterface.addColumn('snapshots', name, {
          type,
          defaultValue: -1,
          allowNull: false
        })
      )
    );

    return actions;
  },

  down: (queryInterface, Sequelize) => {
    const newColumns = [...getActivityColumns(Sequelize), ...getBossColumns(Sequelize)];

    const actions = Promise.all(
      newColumns.map(({ name }) => queryInterface.removeColumn('snapshots', name))
    );

    return actions;
  }
};
