import { Player, Snapshot } from '../../database/models';
import jobs from '../jobs';
import * as discordService from '../services/external/discord.service';
import metrics from '../services/external/metrics.service';
import * as achievementService from '../services/internal/achievement.service';
import * as competitionService from '../services/internal/competition.service';
import * as deltaService from '../services/internal/delta.service';

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

  // Setup jobs to assert the player's account type and auto-update them
  jobs.add('UpdatePlayer', { username: player.username, source: 'Player:OnPlayerNameChanged' });
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
  }
}

async function onPlayerImported(playerId: number) {
  // Reevaluate this player's achievements to try and find earlier completion dates
  await metrics.measureReaction('ReevaluateAchievements', () =>
    achievementService.reevaluateAchievements(playerId)
  );
}

export { onPlayerTypeChanged, onPlayerNameChanged, onPlayerUpdated, onPlayerImported };
