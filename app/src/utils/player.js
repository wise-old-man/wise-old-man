export function getPlayerIcon(type, flagged) {
  return `/img/runescape/icons_small/${flagged ? 'flagged' : type}.png`;
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

export function getPlayerTooltip(type, flagged) {
  if (flagged) {
    return 'This player is flagged. Likely caused by an unregistered name change. Join our Discord to submit one.';
  }

  // Unknown player types happen when tracking fails,
  // so re-tracking should fix it.
  if (type === 'unknown') {
    return 'This player has an unknown player type. Likely caused by not existing in the hiscores.';
  }

  return `Player type: ${type}.`;
}
