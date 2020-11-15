import { Achievement } from '../../database/models';
import * as discordService from '../services/external/discord.service';

async function onAchievementsCreated(achievements: Achievement[]) {
  // Dispatch this new achievements to the discord bot (for broadcasting)
  discordService.dispatchAchievements(achievements[0].playerId, achievements);
}

export { onAchievementsCreated };
