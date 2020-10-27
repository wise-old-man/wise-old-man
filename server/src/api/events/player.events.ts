import { Player, Snapshot } from '../../database/models';
import jobs from '../jobs';
import * as achievementService from '../services/internal/achievement.service';
import * as competitionService from '../services/internal/competition.service';
import * as deltaService from '../services/internal/delta.service';

function onPlayerCreated(player: Player) {
  // Confirm this player's name capitalization
  jobs.add('AssertPlayerName', { id: player.id }, { attempts: 5, backoff: 30000 });
}

function onPlayerNameChanged(player: Player) {
  // Recalculate player achievements
  achievementService.syncAchievements(player.id);

  // Setup jobs to assert the player's name capitalization and account type
  jobs.add('AssertPlayerName', { id: player.id }, { attempts: 5, backoff: 30000 });
}

async function onPlayerUpdated(snapshot: Snapshot) {
  // Update this player's competition participations (gains)
  competitionService.syncParticipations(snapshot.playerId, snapshot);
  // Check for new achievements
  achievementService.syncAchievements(snapshot.playerId);

  const player = await snapshot.$get('player');
  if (!player) return;

  // Update this player's deltas (gains)
  deltaService.syncDeltas(player, snapshot);
}

function onPlayerImported(playerId: number) {
  achievementService.reevaluateAchievements(playerId);
}

export { onPlayerCreated, onPlayerNameChanged, onPlayerUpdated, onPlayerImported };
