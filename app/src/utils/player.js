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
