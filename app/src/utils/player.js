export function standardize(username) {
  return sanitize(username).toLowerCase();
}

export function sanitize(username) {
  return username.replace(/[-_\s]/g, ' ').trim();
}

export function getPlayerTypeIcon(type) {
  return `/img/runescape/icons_small/${type}.png`;
}

export function getPlayerTooltip(type, flagged) {
  if (flagged) {
    return 'This player is flagged. Likely caused by an unregistered name change. Join our Discord to submit one.';
  }

  // Unknown player types happen when the first tracking attempt fails,
  // so re-tracking should fix it.
  if (type === 'unknown') {
    return 'This player has an unknown player type. Likely caused by not existing in the hiscores.';
  }

  return `Player type: ${type}.`;
}

export function getRoleTypeIcon(role) {
  if (role === 'member') return '/img/runescape/roles/Minion.png';

  return `/img/runescape/roles/${role.replace(/_/g, ' ')}.png`;
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
