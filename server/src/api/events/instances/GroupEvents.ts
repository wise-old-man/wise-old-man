import axios from 'axios';
import env from '../../../env';
import discord from '../../discord';
import jobs from '../../jobs';
import * as playerService from '../../modules/players/player.service';

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

  const body = {
    type: 'GROUP_MEMBERS_LEFT',
    api_token: env.DISCORD_BOT_API_TOKEN,
    data: { groupId, players }
  };

  axios.post(env.DISCORD_BOT_API_URL, body);
}

export { onMembersJoined, onMembersLeft };
