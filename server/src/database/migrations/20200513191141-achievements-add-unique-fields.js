export default {
  up: queryInterface => {
    return queryInterface.addIndex('achievements', ['playerId', 'type'], {
      indexName: 'achievements_playerId_type',
      unique: true
    });
  },

  down: queryInterface => {
    return queryInterface.removeIndex('achievements', '`achievements_playerId_type`');
  }
};
