import { Player, Snapshot } from '../../database/models';
import jobs from '../jobs';
import * as discordService from '../services/external/discord.service';
import metrics from '../services/external/metrics.service';
import * as achievementService from '../services/internal/achievement.service';
import * as competitionService from '../services/internal/competition.service';
import * as deltaService from '../services/internal/delta.service';
import * as playerService from '../services/internal/player.service';

// async function onPlayerCreated(player: Player) {
//   // Confirm this player's name capitalization
//   // jobs.add('AssertPlayerName', { id: player.id }, { attempts: 5, backoff: 30000 });
// }

async function onPlayerTypeChanged(player: Player, previousType: string) {
  if (previousType === 'hardcore' && player.type === 'ironman') {
    // Dispatch a "HCIM player died" event to our discord bot API.
    await metrics.measureReaction('DiscordHardcoreDied', () =>
      discordService.dispatchHardcoreDied(player)
    );
  }
}

async function onPlayerNameChanged(player: Player, previousDisplayName: string) {
  // Recalculate player achievements
  await metrics.measureReaction('SyncAchievements', () =>
    achievementService.syncAchievements(player.id)
  );

  // Dispatch a "Player name changed" event to our discord bot API.
  await metrics.measureReaction('DiscordNameChanged', () =>
    discordService.dispatchNameChanged(player, previousDisplayName)
  );

  // Setup jobs to assert the player's name capitalization and account type
  // jobs.add('AssertPlayerName', { id: player.id }, { attempts: 5, backoff: 30000 });
  jobs.add('AssertPlayerType', { id: player.id }, { attempts: 5, backoff: 30000 });
}

async function onPlayerUpdated(snapshot: Snapshot) {
  // Update this player's competition participations (gains)
  await metrics.measureReaction('SyncParticipations', () =>
    competitionService.syncParticipations(snapshot.playerId, snapshot)
  );

  // Only sync achievements if the player gained any exp/kc this update
  if (snapshot.isChange) {
    // Check for new achievements
    await metrics.measureReaction('SyncAchievements', () =>
      achievementService.syncAchievements(snapshot.playerId)
    );
  }

  const player = await snapshot.$get('player');

  if (player) {
    // Update this player's deltas (gains)
    await metrics.measureReaction('SyncDeltas', () => deltaService.syncDeltas(player, snapshot));

    // Attempt to import this player's history from CML
    await metrics.measureReaction('ImportCML', () => playerService.importCML(player));

    // If this player is an inactive iron player, their type should be reviewed
    // This allows us to catch de-iron players early, and adjust their type accordingly
    if (await playerService.shouldReviewType(player)) {
      jobs.add('ReviewPlayerType', { id: player.id });
    }
  }
}

async function onPlayerImported(playerId: number) {
  // Reevaluate this player's achievements to try and find earlier completion dates
  await metrics.measureReaction('ReevaluateAchievements', () =>
    achievementService.reevaluateAchievements(playerId)
  );
}

export { onPlayerTypeChanged, onPlayerNameChanged, onPlayerUpdated, onPlayerImported };
