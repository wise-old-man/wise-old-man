module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("competitions", "groupId", {
      type: Sequelize.INTEGER,
      onDelete: "SET NULL",
      references: {
        model: "groups",
        key: "id"
      }
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn("competitions", "groupId");
  }
};
