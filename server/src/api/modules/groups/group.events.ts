import { Membership, PlayerType } from '../../../utils';
import { jobManager, JobType } from '../../jobs';
import metrics from '../../services/external/metrics.service';
import * as discordService from '../../services/external/discord.service';
import * as playerServices from '../players/player.services';
import * as competitionServices from '../competitions/competition.services';

async function onMembersJoined(memberships: Membership[]) {
  const groupId = memberships[0].groupId;
  const playerIds = memberships.map(m => m.playerId);

  // Add these new members to all upcoming and ongoing competitions
  await metrics.measureReaction('AddToGroupCompetitions', () =>
    competitionServices.addToGroupCompetitions({ groupId, playerIds })
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
    jobManager.add({ type: JobType.UPDATE_PLAYER, payload: { username } });
  });
}

async function onMembersLeft(groupId: number, playerIds: number[]) {
  // Remove these players from ongoing/upcoming group competitions
  await metrics.measureReaction('RemoveFromGroupCompetitions', () =>
    competitionServices.removeFromGroupCompetitions({ groupId, playerIds })
  );

  // Dispatch this event to the discord service
  await metrics.measureReaction('DiscordMembersLeft', () =>
    discordService.dispatchMembersLeft(groupId, playerIds)
  );
}

export { onMembersJoined, onMembersLeft };
