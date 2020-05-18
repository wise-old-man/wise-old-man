module.exports = {
  up: queryInterface => {
    return queryInterface.addIndex('players', ['type'], {
      indexName: 'players_type'
    });
  },

  down: queryInterface => {
    return queryInterface.removeIndex('players', '`players_type`');
  }
};
