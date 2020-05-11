module.exports = {
  up: queryInterface => {
    return queryInterface.addIndex('deltas', ['playerId', 'period'], {
      indexName: 'deltas_playerId_period',
      unique: true
    });
  },

  down: queryInterface => {
    return queryInterface.removeIndex('deltas', '`deltas_playerId_period`');
  }
};
