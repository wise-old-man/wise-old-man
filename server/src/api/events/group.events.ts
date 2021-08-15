import * as discordService from '../services/external/discord.service';
import logger from '../services/external/logger.service';
import metrics from '../services/external/metrics.service';
import * as competitionService from '../services/internal/competition.service';

async function onMembersJoined(groupId: number, playerIds: number[]) {
  // Temporary logging
  playerIds.forEach(id => {
    logger.info(`${id} joined ${groupId}`, {});
  });

  // Add these new members to all upcoming and ongoing competitions
  await metrics.measureReaction('AddToGroupCompetitions', () =>
    competitionService.addToGroupCompetitions(groupId, playerIds)
  );

  // Dispatch this event to the discord service
  await metrics.measureReaction('DiscordMembersJoined', () =>
    discordService.dispatchMembersJoined(groupId, playerIds)
  );
}

async function onMembersLeft(groupId: number, playerIds: number[]) {
  // Temporary logging
  playerIds.forEach(id => {
    logger.info(`${id} left ${groupId}`, {});
  });

  // Remove these players from ongoing/upcoming group competitions
  await metrics.measureReaction('RemoveFromGroupCompetitions', () =>
    competitionService.removeFromGroupCompetitions(groupId, playerIds)
  );

  // Dispatch this event to the discord service
  await metrics.measureReaction('DiscordMembersLeft', () =>
    discordService.dispatchMembersLeft(groupId, playerIds)
  );
}

export { onMembersJoined, onMembersLeft };
