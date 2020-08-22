import { Player, Snapshot } from '../../database/models';
import jobs from '../jobs';

function onPlayerCreated(player: Player) {
  jobs.add('AssertPlayerName', { username: player.username }, { attempts: 5, backoff: 30000 });
}

function onPlayerNameChanged(player: Player) {
  jobs.add('SyncPlayerAchievements', { playerId: player.id });
  jobs.add('AssertPlayerName', { username: player.username }, { attempts: 5, backoff: 30000 });
  jobs.add('AssertPlayerType', { username: player.username }, { attempts: 5, backoff: 30000 });
}

function onPlayerUpdated(snapshot: Snapshot) {
  jobs.add('ImportPlayer', { playerId: snapshot.playerId });
  jobs.add('SyncPlayerAchievements', { playerId: snapshot.playerId });
  jobs.add('SyncPlayerDeltas', { playerId: snapshot.playerId, latestSnapshot: snapshot });

  // Delay this to ensure SyncPlayerDeltas runs first
  // TODO: change this to a DeltasUpdated event
  jobs.add('SyncPlayerRecords', { playerId: snapshot.playerId }, { delay: 10000 });
}

function onPlayerImported(playerId: number) {
  jobs.add('SyncPlayerRecords', { playerId });
  jobs.add('ReevaluatePlayerAchievements', { playerId });
}

export { onPlayerCreated, onPlayerNameChanged, onPlayerUpdated, onPlayerImported };
