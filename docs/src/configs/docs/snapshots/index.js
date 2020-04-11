import entities from './entities';
import endpoints from './endpoints';

export default {
  title: 'Snapshots',
  url: '/docs/snapshots',
  description:
    "A snapshot represents a player's account stats at any given point in time,\
    this currently includes the experience and ranks of all the skills (and overall).",
  entities,
  endpoints,
};
