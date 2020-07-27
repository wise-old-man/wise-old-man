import jobs from '../../jobs';

function onPlayerCreated(username) {
  jobs.add('AssertPlayerName', { username }, { attempts: 5, backoff: 30000 });
}

function onPlayerUpdated(playerId) {
  jobs.add('SyncPlayerAchievements', { playerId });
  jobs.add('SyncPlayerInitialValues', { playerId });

  // Delay this to ensure SyncPlayerInitialValues runs first
  jobs.add('SyncPlayerRecords', { playerId }, { delay: 10000 });
}

function onPlayerImported(playerId) {
  jobs.add('SyncPlayerRecords', { playerId });
  jobs.add('ReevaluatePlayerAchievements', { playerId });
}

export { onPlayerCreated, onPlayerUpdated, onPlayerImported };
