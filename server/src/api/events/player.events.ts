import { Player, Snapshot } from '../../database/models';
import jobs from '../jobs';
import * as achievementService from '../services/internal/achievement.service';
import * as competitionService from '../services/internal/competition.service';

function onPlayerCreated(player: Player) {
  jobs.add('AssertPlayerName', { username: player.username }, { attempts: 5, backoff: 30000 });
}

function onPlayerNameChanged(player: Player) {
  achievementService.syncAchievements(player.id);
  jobs.add('AssertPlayerName', { username: player.username }, { attempts: 5, backoff: 30000 });
  jobs.add('AssertPlayerType', { username: player.username }, { attempts: 5, backoff: 30000 });
}

function onPlayerUpdated(snapshot: Snapshot) {
  jobs.add('ImportPlayer', { playerId: snapshot.playerId });
  achievementService.syncAchievements(snapshot.playerId);
  jobs.add('SyncPlayerDeltas', { playerId: snapshot.playerId, latestSnapshot: snapshot });
  competitionService.syncParticipations(snapshot.playerId, snapshot);
}

function onPlayerImported(playerId: number) {
  jobs.add('SyncPlayerRecords', { playerId });
  jobs.add('ReevaluatePlayerAchievements', { playerId });
}

export { onPlayerCreated, onPlayerNameChanged, onPlayerUpdated, onPlayerImported };
