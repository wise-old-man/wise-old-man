import { PlayerType } from '@wise-old-man/utils';
import { Player, Snapshot } from '../../database/models';
import jobs from '../jobs';
import * as discordService from '../services/external/discord.service';
import metrics from '../services/external/metrics.service';
import * as achievementServices from '../modules/achievements/achievement.services';
import * as competitionService from '../services/internal/competition.service';
import * as deltaService from '../services/internal/delta.service';
import * as playerService from '../services/internal/player.service';

async function onPlayerTypeChanged(player: Player, previousType: string) {
  if (previousType === PlayerType.HARDCORE && player.type === PlayerType.IRONMAN) {
    // Dispatch a "HCIM player died" event to our discord bot API.
    await metrics.measureReaction('DiscordHardcoreDied', () => discordService.dispatchHardcoreDied(player));
  }
}

async function onPlayerNameChanged(player: Player, previousDisplayName: string) {
  // Recalculate player achievements
  await metrics.measureReaction('SyncAchievements', () =>
    achievementServices.syncPlayerAchievements({ id: player.id })
  );

  // Dispatch a "Player name changed" event to our discord bot API.
  await metrics.measureReaction('DiscordNameChanged', () =>
    discordService.dispatchNameChanged(player, previousDisplayName)
  );

  // Setup jobs to assert the player's account type and auto-update them
  jobs.add('UpdatePlayer', { username: player.username, source: 'Player:OnPlayerNameChanged' });
  jobs.add('AssertPlayerType', { id: player.id });
}

async function onPlayerUpdated(snapshot: Snapshot) {
  // Update this player's competition participations (gains)
  await metrics.measureReaction('SyncParticipations', () =>
    competitionService.syncParticipations(snapshot.playerId, snapshot)
  );

  // Only sync achievements if the player gained any exp/kc this update
  // if (snapshot.isChange) {
  // Check for new achievements
  await metrics.measureReaction('SyncAchievements', () =>
    achievementServices.syncPlayerAchievements({ id: snapshot.playerId })
  );
  // }

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
    achievementServices.reevaluatePlayerAchievements({ id: playerId })
  );
}

export { onPlayerTypeChanged, onPlayerNameChanged, onPlayerUpdated, onPlayerImported };
