import entities from './entities';
import endpoints from './endpoints';

export default {
  title: 'Players',
  url: '/docs/players',
  description:
    "A player represents a singular Runescape account.\
    \n\n The player's type starts out as 'unknown' but will eventually be determined\
    as the player is tracked.",
  entities,
  endpoints,
};
