export = {
  up: queryInterface => {
    return queryInterface.removeColumn('participations', 'startSnapshotId');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('participations', 'startSnapshotId', {
      type: Sequelize.INTEGER
    });
  }
};
