import { Snapshot, Player } from '../../../prisma';
import { FlaggedPlayerReviewContext, PlayerType } from '../../../utils';
import { jobManager, JobType } from '../../jobs';
import * as discordService from '../../services/external/discord.service';
import metrics from '../../services/external/metrics.service';
import { reevaluatePlayerAchievements } from '../achievements/services/ReevaluatePlayerAchievementsService';
import { syncPlayerAchievements } from '../achievements/services/SyncPlayerAchievementsService';
import { syncParticipations } from '../competitions/services/SyncParticipationsService';
import { syncPlayerDeltas } from '../deltas/services/SyncPlayerDeltasService';
import { importPlayerHistory } from './services/ImportPlayerHistoryService';

async function onPlayerFlagged(player: Player, flaggedContext: FlaggedPlayerReviewContext) {
  await metrics.trackEffect(discordService.dispatchPlayerFlaggedReview, player, flaggedContext);
}

async function onPlayerArchived(player: Player, previousDisplayName: string) {
  const successMessage = `🟢 \`${previousDisplayName}\` has been archived. (\`${player.username}\`)`;
  await metrics.trackEffect(discordService.sendMonitoringMessage, successMessage);
}

async function onPlayerTypeChanged(player: Player, previousType: PlayerType) {
  if (previousType === PlayerType.HARDCORE && player.type === PlayerType.IRONMAN) {
    // Dispatch a "HCIM player died" event to our discord bot API.
    await metrics.trackEffect(discordService.dispatchHardcoreDied, player);
  }
}

async function onPlayerNameChanged(player: Player, previousDisplayName: string) {
  // Recalculate player achievements
  await metrics.trackEffect(syncPlayerAchievements, { id: player.id });

  // Dispatch a "Player name changed" event to our discord bot API.
  await metrics.trackEffect(discordService.dispatchNameChanged, player, previousDisplayName);

  // Setup jobs to assert the player's account type and auto-update them
  jobManager.add({
    type: JobType.UPDATE_PLAYER,
    payload: { username: player.username }
  });

  jobManager.add({
    type: JobType.ASSERT_PLAYER_TYPE,
    payload: { playerId: player.id }
  });
}

async function onPlayerUpdated(
  player: Player,
  previous: Snapshot | undefined,
  current: Snapshot,
  hasChanged: boolean
) {
  // Update this player's competition participations (gains)
  await metrics.trackEffect(syncParticipations, player.id, current.id);

  // Only sync achievements if the player gained any exp/kc this update
  if (hasChanged) {
    // Check for new achievements
    await metrics.trackEffect(syncPlayerAchievements, player.id, previous, current);
  }

  // Update this player's deltas (gains)
  await metrics.trackEffect(syncPlayerDeltas, player, current);

  // Attempt to import this player's history from CML
  await metrics.trackEffect(importPlayerHistory, player);
}

async function onPlayerImported(playerId: number) {
  // Reevaluate this player's achievements to try and find earlier completion dates
  await metrics.trackEffect(reevaluatePlayerAchievements, { id: playerId });
}

export {
  onPlayerFlagged,
  onPlayerArchived,
  onPlayerTypeChanged,
  onPlayerNameChanged,
  onPlayerUpdated,
  onPlayerImported
};
