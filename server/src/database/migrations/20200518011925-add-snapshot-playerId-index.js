export default {
  up: queryInterface => {
    return queryInterface.addIndex('snapshots', ['playerId'], {
      indexName: 'snapshots_playerId'
    });
  },

  down: queryInterface => {
    return queryInterface.removeIndex('snapshots', '`snapshots_playerId`');
  }
};
