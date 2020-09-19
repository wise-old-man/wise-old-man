import { Player, Snapshot } from '../../database/models';
import jobs from '../jobs';
import * as achievementService from '../services/internal/achievement.service';
import * as competitionService from '../services/internal/competition.service';
import * as playerService from '../services/internal/player.service';

function onPlayerCreated(player: Player) {
  jobs.add('AssertPlayerName', { username: player.username }, { attempts: 5, backoff: 30000 });
}

function onPlayerNameChanged(player: Player) {
  achievementService.syncAchievements(player.id);
  jobs.add('AssertPlayerName', { username: player.username }, { attempts: 5, backoff: 30000 });
  jobs.add('AssertPlayerType', { username: player.username }, { attempts: 5, backoff: 30000 });
}

async function onPlayerUpdated(snapshot: Snapshot) {
  achievementService.syncAchievements(snapshot.playerId);
  jobs.add('SyncPlayerDeltas', { playerId: snapshot.playerId, latestSnapshot: snapshot });
  competitionService.syncParticipations(snapshot.playerId, snapshot);

  const player = await snapshot.$get('player');
  if (!player) return;

  playerService.importCML(player.username);
}

function onPlayerImported(playerId: number) {
  achievementService.reevaluateAchievements(playerId);
}

export { onPlayerCreated, onPlayerNameChanged, onPlayerUpdated, onPlayerImported };
