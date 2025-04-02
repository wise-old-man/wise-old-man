import { jobManager as newJobManager, JobType } from '../../../jobs-new';
import { Player } from '../../../prisma';
import { FlaggedPlayerReviewContext, PlayerType } from '../../../utils';
import * as discordService from '../../services/external/discord.service';
import prometheus from '../../services/external/prometheus.service';
import { reevaluatePlayerAchievements } from '../achievements/services/ReevaluatePlayerAchievementsService';

async function onPlayerFlagged(player: Player, flaggedContext: FlaggedPlayerReviewContext) {
  await prometheus.trackEffect('dispatchPlayerFlaggedReview', async () => {
    discordService.dispatchPlayerFlaggedReview(player, flaggedContext);
  });
}

async function onPlayerArchived(_player: Player, _previousDisplayName: string) {}

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

  newJobManager.add(JobType.UPDATE_PLAYER, { username: player.username, source: 'on-player-name-changed' });
  newJobManager.add(JobType.ASSERT_PLAYER_TYPE, { username: player.username });
}

async function onPlayerImported(playerId: number) {
  // Reevaluate this player's achievements to try and find earlier completion dates
  await prometheus.trackEffect('reevaluatePlayerAchievements', async () => {
    await reevaluatePlayerAchievements(playerId);
  });
}

export { onPlayerArchived, onPlayerFlagged, onPlayerImported, onPlayerNameChanged, onPlayerTypeChanged };
