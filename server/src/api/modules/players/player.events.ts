import { Snapshot, Player } from '../../../prisma';
import { FlaggedPlayerReviewContext } from '../../../utils';
import { jobManager, JobType } from '../../jobs';
import * as discordService from '../../services/external/discord.service';
import metrics from '../../services/external/metrics.service';
import * as achievementServices from '../achievements/achievement.services';
import * as competitionServices from '../competitions/competition.services';
import * as deltaServices from '../deltas/delta.services';
import * as playerServices from './player.services';

async function onPlayerFlagged(player: Player, flaggedContext: FlaggedPlayerReviewContext) {
  await metrics.trackEffect(discordService.dispatchPlayerFlaggedReview, player, flaggedContext);
}

async function onPlayerArchived(player: Player, previousDisplayName: string) {
  const successMessage = `🟢 \`${previousDisplayName}\` has been archived. (\`${player.username}\`)`;
  await metrics.trackEffect(discordService.sendMonitoringMessage, successMessage);
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
}

async function onPlayerUpdated(
  player: Player,
  previous: Snapshot | undefined,
  current: Snapshot,
  hasChanged: boolean
) {
  // Update this player's competition participations (gains)
  await metrics.trackEffect(competitionServices.syncParticipations, player.id, current.id);

  // Only sync achievements if the player gained any exp/kc this update
  if (hasChanged) {
    // Check for new achievements
    await metrics.trackEffect(achievementServices.syncPlayerAchievements, player.id, previous, current);
  }

  // Update this player's deltas (gains)
  await metrics.trackEffect(deltaServices.syncPlayerDeltas, player, current);

  // Attempt to import this player's history from CML
  await metrics.trackEffect(playerServices.importPlayerHistory, player);
}

async function onPlayerImported(playerId: number) {
  // Reevaluate this player's achievements to try and find earlier completion dates
  await metrics.trackEffect(achievementServices.reevaluatePlayerAchievements, { id: playerId });
}

export { onPlayerFlagged, onPlayerArchived, onPlayerNameChanged, onPlayerUpdated, onPlayerImported };
