export = {
  up: queryInterface => {
    return queryInterface.removeColumn('participations', 'endSnapshotId');
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('participations', 'endSnapshotId', {
      type: Sequelize.INTEGER
    });
  }
};
