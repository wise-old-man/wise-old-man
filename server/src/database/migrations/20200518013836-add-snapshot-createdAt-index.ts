export default {
  up: queryInterface => {
    return queryInterface.addIndex('snapshots', ['createdAt'], {
      indexName: 'snapshots_createdAt'
    });
  },

  down: queryInterface => {
    return queryInterface.removeIndex('snapshots', '`snapshots_createdAt`');
  }
};
