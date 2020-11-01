export function getPlayerIcon(leagueTier, flagged) {
  return `/img/runescape/icons_small/${flagged ? 'flagged' : `league_${leagueTier}`}.png`;
}

export function getPlayerBuild(build) {
  switch (build) {
    case '1def':
      return '1 Def Pure';
    case 'lvl3':
      return 'Level 3';
    case 'f2p':
      return 'F2P';
    case '10hp':
      return '10 Hitpoints Pure';
    default:
      return 'Main';
  }
}

export function getOfficialHiscoresUrl(player) {
  const username = encodeURI(player.username);
  return `https://secure.runescape.com/m=hiscore_oldschool_seasonal/hiscorepersonal.ws?user1=${username}`;
}

export function getPlayerTooltip(leagueTier, flagged) {
  if (flagged) {
    return 'This player is flagged. Likely caused by an unregistered name change. Join our Discord to submit one.';
  }

  return `TrailBlazer League tier: ${leagueTier}`;
}
