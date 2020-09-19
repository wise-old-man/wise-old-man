import { Player, Snapshot } from '../../database/models';
import jobs from '../jobs';
import * as achievementService from '../services/internal/achievement.service';
import * as competitionService from '../services/internal/competition.service';
import * as deltaService from '../services/internal/delta.service';
import * as playerService from '../services/internal/player.service';

function onPlayerCreated(player: Player) {
  const { username } = player;

  // Confirm this player's name capitalization
  jobs.add('AssertPlayerName', { username }, { attempts: 5, backoff: 30000 });
}

function onPlayerNameChanged(player: Player) {
  const { id, username } = player;

  // Recalculate player achievements
  achievementService.syncAchievements(id);

  // Setup jobs to assert the player's name capitalization and account type
  jobs.add('AssertPlayerName', { username }, { attempts: 5, backoff: 30000 });
  jobs.add('AssertPlayerType', { username }, { attempts: 5, backoff: 30000 });
}

async function onPlayerUpdated(snapshot: Snapshot) {
  // Update this player's deltas (gains)
  deltaService.syncDeltas(snapshot);
  // Update this player's competition participations (gains)
  competitionService.syncParticipations(snapshot.playerId, snapshot);
  // Check for new achievements
  achievementService.syncAchievements(snapshot.playerId);

  const player = await snapshot.$get('player');
  if (!player) return;

  // Attempt to import this player's history from CML
  playerService.importCML(player.username);
}

function onPlayerImported(playerId: number) {
  achievementService.reevaluateAchievements(playerId);
}

export { onPlayerCreated, onPlayerNameChanged, onPlayerUpdated, onPlayerImported };
