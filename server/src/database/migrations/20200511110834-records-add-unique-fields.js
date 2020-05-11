module.exports = {
  up: queryInterface => {
    return queryInterface.addIndex('records', ['playerId', 'period', 'metric'], {
      indexName: 'records_playerId_period_metric',
      unique: true
    });
  },

  down: queryInterface => {
    return queryInterface.removeIndex('records', '`records_playerId_period_metric`');
  }
};
