import { PlayerType, Snapshot, Player as PrismaPlayer } from '../../prisma';
import { Player } from '../../database/models';
import jobs from '../jobs';
import * as discordService from '../services/external/discord.service';
import metrics from '../services/external/metrics.service';
import * as achievementServices from '../modules/achievements/achievement.services';
import * as competitionService from '../services/internal/competition.service';
import * as deltaServices from '../modules/deltas/delta.services';
import * as playerUtils from '../modules/players/player.utils';
import * as playerServices from '../modules/players/player.services';

async function onPlayerTypeChanged(player: PrismaPlayer, previousType: string) {
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
    competitionService.syncParticipations(snapshot.playerId, snapshot.id)
  );

  // Only sync achievements if the player gained any exp/kc this update
  // if (snapshot.isChange) {
  // Check for new achievements
  await metrics.measureReaction('SyncAchievements', () =>
    achievementServices.syncPlayerAchievements({ id: snapshot.playerId })
  );
  // }

  const [player] = await playerServices.findPlayer({ id: snapshot.playerId });

  if (player) {
    // Update this player's deltas (gains)
    await metrics.measureReaction('SyncDeltas', () => deltaServices.syncPlayerDeltas(player, snapshot));

    // Attempt to import this player's history from CML
    await metrics.measureReaction('ImportCML', () => playerServices.importPlayerHistory(player));

    // If this player is an inactive iron player, their type should be reviewed
    // This allows us to catch de-iron players early, and adjust their type accordingly
    if (await playerUtils.shouldReviewType(player)) {
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
