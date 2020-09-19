import jobs from '../jobs';
import * as discordService from '../services/external/discord.service';
import * as competitionService from '../services/internal/competition.service';

async function onMembersJoined(groupId: number, playerIds: number[]) {
  // Add these new members to all upcoming and ongoing competitions
  competitionService.addToGroupCompetitions(groupId, playerIds);

  // Dispatch this event to the discord service
  discordService.dispatchMembersJoined(groupId, playerIds);
}

async function onMembersLeft(groupId: number, playerIds: number[]) {
  // Add a job to remove these new users to ongoing/upcoming group competitions
  jobs.add('RemoveFromGroupCompetitions', { groupId, playerIds });

  // Dispatch this event to the discord service
  discordService.dispatchMembersLeft(groupId, playerIds);
}

export { onMembersJoined, onMembersLeft };
