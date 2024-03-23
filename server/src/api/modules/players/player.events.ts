import { Snapshot, Player } from '../../../prisma';
import { FlaggedPlayerReviewContext, PlayerType } from '../../../utils';
import { jobManager, JobType } from '../../jobs';
import * as discordService from '../../services/external/discord.service';
import prometheus from '../../services/external/prometheus.service';
import { reevaluatePlayerAchievements } from '../achievements/services/ReevaluatePlayerAchievementsService';
import { syncPlayerAchievements } from '../achievements/services/SyncPlayerAchievementsService';
import { syncParticipations } from '../competitions/services/SyncParticipationsService';
import { syncPlayerDeltas } from '../deltas/services/SyncPlayerDeltasService';

async function onPlayerFlagged(player: Player, flaggedContext: FlaggedPlayerReviewContext) {
  await prometheus.trackEffect('dispatchPlayerFlaggedReview', async () => {
    discordService.dispatchPlayerFlaggedReview(player, flaggedContext);
  });
}

async function onPlayerArchived(player: Player, previousDisplayName: string) {
  await prometheus.trackEffect('sendMonitoringMessage', async () => {
    await discordService.sendMonitoringMessage(
      `🟢 \`${previousDisplayName}\` has been archived. (\`${player.username}\`)`
    );
  });
}

async function onPlayerTypeChanged(player: Player, previousType: PlayerType) {
  if (previousType === PlayerType.HARDCORE && player.type === PlayerType.IRONMAN) {
    // Dispatch a "HCIM player died" event to our discord bot API.
    await prometheus.trackEffect('dispatchHardcoreDied', async () => {
      await discordService.dispatchHardcoreDied(player);
    });
  }
}

async function onPlayerNameChanged(player: Player, previousDisplayName: string) {
  // Reevaluate this player's achievements to try and find earlier completion dates as there might be new data
  await prometheus.trackEffect('reevaluatePlayerAchievements', async () => {
    await reevaluatePlayerAchievements(player.id);
  });

  // Dispatch a "Player name changed" event to our discord bot API.
  await prometheus.trackEffect('dispatchNameChanged', async () => {
    await discordService.dispatchNameChanged(player, previousDisplayName);
  });

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
  await prometheus.trackEffect('syncParticipations', async () => {
    await syncParticipations(player.id, current.id);
  });

  // Only sync achievements if the player gained any exp/kc this update
  if (hasChanged) {
    await prometheus.trackEffect('syncPlayerAchievements', async () => {
      syncPlayerAchievements(player.id, previous, current);
    });
  }

  // Update this player's deltas (gains)
  await prometheus.trackEffect('syncPlayerDeltas', async () => {
    await syncPlayerDeltas(player, current);
  });
}

async function onPlayerImported(playerId: number) {
  // Reevaluate this player's achievements to try and find earlier completion dates
  await prometheus.trackEffect('reevaluatePlayerAchievements', async () => {
    await reevaluatePlayerAchievements(playerId);
  });
}

export {
  onPlayerFlagged,
  onPlayerArchived,
  onPlayerTypeChanged,
  onPlayerNameChanged,
  onPlayerUpdated,
  onPlayerImported
};
