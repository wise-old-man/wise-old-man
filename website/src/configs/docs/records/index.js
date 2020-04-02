import entities from './entities';
import endpoints from './endpoints';

export default {
  title: 'Records',
  url: '/docs/records',
  description:
    'A record represents a player\'s absolute best deltas for a specific period and metric .\
    \n Ex: Best firemaking exp gained in a week by "Zezima"',
  entities,
  endpoints,
};
