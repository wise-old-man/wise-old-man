import * as playerService from '@services/internal/players';
import jobs from '../../jobs';
import discord from '../../util/discord';

async function onMembersJoined(groupId: number, playerIds: number[]) {
  jobs.add('AddToGroupCompetitions', { groupId, playerIds });

  const players = await playerService.findAllByIds(playerIds);

  if (!players || players.length === 0) {
    return;
  }

  discord.dispatch('GROUP_MEMBERS_JOINED', { groupId, players });
}

async function onMembersLeft(groupId: number, playerIds: number[]) {
  jobs.add('RemoveFromGroupCompetitions', { groupId, playerIds });

  const players = await playerService.findAllByIds(playerIds);

  if (!players || players.length === 0) {
    return;
  }

  discord.dispatch('GROUP_MEMBERS_LEFT', { groupId, players });
}

export { onMembersJoined, onMembersLeft };
