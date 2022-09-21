import { Snapshot, Player } from '../../../prisma';
import { PlayerType } from '../../../utils';
import { jobManager, JobType } from '../../jobs';
import * as discordService from '../../services/external/discord.service';
import metrics from '../../services/external/metrics.service';
import * as achievementServices from '../achievements/achievement.services';
import * as competitionServices from '../competitions/competition.services';
import * as deltaServices from '../deltas/delta.services';
import * as playerUtils from './player.utils';
import * as playerServices from './player.services';

async function onPlayerTypeChanged(player: Player, previousType: PlayerType) {
  if (previousType === PlayerType.HARDCORE && player.type === PlayerType.IRONMAN) {
    // Dispatch a "HCIM player died" event to our discord bot API.
    await metrics.trackEffect(discordService.dispatchHardcoreDied, player);
  }
}

async function onPlayerNameChanged(player: Player, previousDisplayName: string) {
  // Recalculate player achievements
  await metrics.trackEffect(achievementServices.syncPlayerAchievements, { id: player.id });

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

async function onPlayerUpdated(player: Player, snapshot: Snapshot, hasChanged: boolean) {
  // Update this player's competition participations (gains)
  await metrics.trackEffect(competitionServices.syncParticipations, {
    playerId: snapshot.playerId,
    latestSnapshotId: snapshot.id
  });

  // Only sync achievements if the player gained any exp/kc this update
  if (hasChanged) {
    // Check for new achievements
    await metrics.trackEffect(achievementServices.syncPlayerAchievements, { id: snapshot.playerId });
  }

  // Update this player's deltas (gains)
  await metrics.trackEffect(deltaServices.syncPlayerDeltas, player, snapshot);

  // Attempt to import this player's history from CML
  await metrics.trackEffect(playerServices.importPlayerHistory, player);

  // If this player is an inactive iron player, their type should be reviewed
  // This allows us to catch de-iron players early, and adjust their type accordingly
  if (await playerUtils.shouldReviewType(player)) {
    jobManager.add({
      type: JobType.REVIEW_PLAYER_TYPE,
      payload: { playerId: player.id }
    });
  }
}

async function onPlayerImported(playerId: number) {
  // Reevaluate this player's achievements to try and find earlier completion dates
  await metrics.trackEffect(achievementServices.reevaluatePlayerAchievements, { id: playerId });
}

export { onPlayerTypeChanged, onPlayerNameChanged, onPlayerUpdated, onPlayerImported };
