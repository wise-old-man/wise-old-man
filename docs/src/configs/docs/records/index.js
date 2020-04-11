import entities from './entities';
import endpoints from './endpoints';

export default {
  title: 'Records',
  url: '/docs/records',
  description:
    "A record represents a player's absolute best deltas for a specific period and metric .\
    \n Ex: Best firemaking exp gained in a week by \"Zezima\" \
    \n\n When a player's deltas change, their values are compared to the player's previous records,\
    if the new delta values are higher than the player's records, those records get updated with\
    the new values.",
  entities,
  endpoints,
};
