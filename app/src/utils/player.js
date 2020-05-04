export function getPlayerTypeIcon(type) {
  return `/img/runescape/player_types/${type}.png`;
}

export function getOfficialHiscoresUrl(player) {
  const username = encodeURI(player.username);
  let suffix;

  switch (player.type) {
    case 'ironman':
      suffix = '_ironman';
      break;
    case 'ultimate':
      suffix = '_ultimate';
      break;
    case 'hardcore':
      suffix = '_hardcore_ironman';
      break;
    case 'regular':
    default:
      suffix = '';
  }

  return `https://secure.runescape.com/m=hiscore_oldschool${suffix}/hiscorepersonal.ws?user1=${username}`;
}

export function getPlayerTooltip(type) {
  // Unknown player types happen when tracking fails,
  // so re-tracking should fix it.
  if (type === 'unknown') {
    return `Player type: ${type}. Please re-track this player to update this.`;
  }

  return `Player type: ${type}.`;
}
