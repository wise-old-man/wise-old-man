import { PlayerType } from '../../utils';
import * as discordService from '../services/external/discord.service';
import logger from '../services/external/logger.service';
import metrics from '../services/external/metrics.service';
import * as competitionService from '../services/internal/competition.service';
import * as playerServices from '../modules/players/player.services';
import jobs from '../jobs';

async function onMembersJoined(groupId: number, playerIds: number[]) {
  // Temporary logging
  playerIds.forEach(id => {
    logger.info(`${id} joined ${groupId}`, {});
  });

  // Add these new members to all upcoming and ongoing competitions
  await metrics.measureReaction('AddToGroupCompetitions', () =>
    competitionService.addToGroupCompetitions(groupId, playerIds)
  );

  // Fetch all the newly added members
  const players = await playerServices.findPlayers({ ids: playerIds });

  // If couldn't find any players for these ids, ignore event
  if (!players || players.length === 0) return;

  // Dispatch this event to the discord service
  await metrics.measureReaction('DiscordMembersJoined', () =>
    discordService.dispatchMembersJoined(groupId, players)
  );

  // Request updates for any new players
  players.forEach(({ username, type, registeredAt }) => {
    if (type !== PlayerType.UNKNOWN || Date.now() - registeredAt.getTime() > 60_000) return;
    jobs.add('UpdatePlayer', { username, source: 'Group:OnMembersJoined' });
  });
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
