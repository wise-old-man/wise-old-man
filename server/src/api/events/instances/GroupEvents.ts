import jobs from '../../jobs';
import * as playerService from '../../modules/players/player.service';
import discord from '../../util/discord';

async function onMembersJoined(groupId, playerIds) {
  jobs.add('AddToGroupCompetitions', { groupId, playerIds });

  const players = await playerService.findAllByIds(playerIds);

  if (!players || players.length === 0) {
    return;
  }

  discord.dispatch('GROUP_MEMBERS_JOINED', { groupId, players });
}

async function onMembersLeft(groupId, playerIds) {
  jobs.add('RemoveFromGroupCompetitions', { groupId, playerIds });

  const players = await playerService.findAllByIds(playerIds);

  if (!players || players.length === 0) {
    return;
  }

  discord.dispatch('GROUP_MEMBERS_LEFT', { groupId, players });
}

export { onMembersJoined, onMembersLeft };
