import discord from '../../discord';
import * as groupService from '../../modules/groups/group.service';
import * as playerService from '../../modules/players/player.service';

async function onAchievementsCreated(achievements) {
  const { playerId } = achievements[0];

  // Filter out any achievements from unknown dates
  const recent = achievements.filter(a => Date.now() - a.createdAt < 30000);

  if (recent.length === 0) {
    return;
  }

  const groups = await groupService.getPlayerGroups(playerId);

  // The following actions are only relevant to players
  // that are group members, so ignore any that aren't
  if (!groups || groups.length === 0) {
    return;
  }

  const player = await playerService.findById(playerId);

  groups.forEach(({ id }) => {
    discord.dispatch('MEMBER_ACHIEVEMENTS', { groupId: id, player, achievements: recent });
  });
}

export { onAchievementsCreated };
