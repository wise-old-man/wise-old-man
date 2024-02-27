import { Achievement } from '../../../prisma';
import * as discordService from '../../services/external/discord.service';
import metrics from '../../services/external/metrics.service';

async function onAchievementsCreated(achievements: Achievement[]) {
  // Dispatch this new achievements to the discord bot (for broadcasting)
  await metrics.trackEffect('dispatchAchievements', async () => {
    await discordService.dispatchAchievements(achievements[0].playerId, achievements);
  });
}

export { onAchievementsCreated };
