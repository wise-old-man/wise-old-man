import { ROLES } from 'config';

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

  return `Shattered Relics League player.`;
}

export function getRoleTypeIcon(role) {
  if (role === 'member') return '/img/runescape/roles/Minion.png';
  return ROLES.find(r => r.value === role).icon;
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
    case 'zerker':
      return 'Zerker';
    default:
      return 'Main';
  }
}

export function getOfficialHiscoresUrl(player) {
  const username = encodeURI(player.username);
  return `https://secure.runescape.com/m=hiscore_oldschool_seasonal/hiscorepersonal.ws?user1=${username}`;
}
