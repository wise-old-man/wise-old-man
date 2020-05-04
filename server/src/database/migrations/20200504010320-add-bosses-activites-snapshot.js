const { ACTIVITIES, BOSSES } = require('../../api/constants/metrics');

function getActivityColumns(Sequelize) {
  return ACTIVITIES.map(activity => [
    { name: `${activity}Rank`, type: Sequelize.INTEGER },
    { name: `${activity}Score`, type: Sequelize.INTEGER }
  ]).flat();
}

function getBossColumns(Sequelize) {
  return BOSSES.map(boss => [
    { name: `${boss}Rank`, type: Sequelize.INTEGER },
    { name: `${boss}Kills`, type: Sequelize.INTEGER }
  ]).flat();
}

module.exports = {
  up: (queryInterface, Sequelize) => {
    const newColumns = [...getActivityColumns(Sequelize), ...getBossColumns(Sequelize)];

    const actions = Promise.all(
      newColumns.map(({ name, type }) => queryInterface.addColumn('snapshots', name, { type }))
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
