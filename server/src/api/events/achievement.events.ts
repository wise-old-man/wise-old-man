import { Achievement } from '../../database/models';
import * as discordService from '../services/external/discord.service';
import metrics from '../services/external/metrics.service';

async function onAchievementsCreated(achievements: Achievement[]) {
  // Dispatch this new achievements to the discord bot (for broadcasting)
  await metrics.measureReaction('DiscordAchievements', () =>
    discordService.dispatchAchievements(achievements[0].playerId, achievements)
  );
}

export { onAchievementsCreated };
