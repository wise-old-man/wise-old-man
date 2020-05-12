module.exports = {
  up: queryInterface => {
    return queryInterface.sequelize.query(
      `UPDATE achievements SET "createdAt" = timestamp 'epoch' WHERE type LIKE '%kills%'`
    );
  },

  down: () => Promise.resolve()
};
