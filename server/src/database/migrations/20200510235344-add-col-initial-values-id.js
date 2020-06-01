export default {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('deltas', 'initialValuesId', {
      type: Sequelize.INTEGER,
      onDelete: 'SET NULL',
      references: {
        model: 'initialValues',
        key: 'id'
      }
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('deltas', 'initialValuesId');
  }
};
