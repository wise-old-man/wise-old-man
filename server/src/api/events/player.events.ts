import { Player, Snapshot } from '../../database/models';
import jobs from '../jobs';
import * as discordService from '../services/external/discord.service';
import logger from '../services/external/logger.service';
import * as achievementService from '../services/internal/achievement.service';
import * as competitionService from '../services/internal/competition.service';
import * as deltaService from '../services/internal/delta.service';
import * as playerService from '../services/internal/player.service';

function onPlayerCreated(player: Player) {
  // Confirm this player's name capitalization
  jobs.add('AssertPlayerName', { id: player.id }, { attempts: 5, backoff: 30000 });
}

function onPlayerTypeChanged(player: Player, previousType: string) {
  if (previousType === 'hardcore' && player.type === 'ironman') {
    // Dispatch a "HCIM player died" event to our discord bot API.
    discordService.dispatchHardcoreDied(player);
  }
}

function onPlayerNameChanged(player: Player, previousDisplayName: string) {
  // Recalculate player achievements
  achievementService.syncAchievements(player.id);

  // Setup jobs to assert the player's name capitalization and account type
  jobs.add('AssertPlayerName', { id: player.id }, { attempts: 5, backoff: 30000 });
  jobs.add('AssertPlayerType', { id: player.id }, { attempts: 5, backoff: 30000 });

  // Dispatch a "Player name changed" event to our discord bot API.
  discordService.dispatchNameChanged(player, previousDisplayName);
}

async function onPlayerUpdated(snapshot: Snapshot) {
  // Update this player's competition participations (gains)
  competitionService.syncParticipations(snapshot.playerId, snapshot);
  // Check for new achievements
  achievementService.syncAchievements(snapshot.playerId);

  const player = await snapshot.$get('player');
  if (!player) return;

  if (playerService.shouldReviewType(player)) {
    // After reviewing this player's type, ensure this action
    // isn't repeated again in the next 3 days
    logger.debug(`Scheduling ${player.id}`, { username: player.username });
    const debounce = { id: player.id, timeout: 86_400_000 * 3 };
    // jobs.add('ReviewPlayerType', { id: player.id }, { delay: 30_000, debounce });
  }

  // Update this player's deltas (gains)
  deltaService.syncDeltas(player, snapshot);

  // Attempt to import this player's history from CML
  playerService.importCML(player);
}

function onPlayerImported(playerId: number) {
  achievementService.reevaluateAchievements(playerId);
}

export { onPlayerCreated, onPlayerTypeChanged, onPlayerNameChanged, onPlayerUpdated, onPlayerImported };
