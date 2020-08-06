import entities from './entities';
import endpoints from './endpoints';

export default {
  title: 'Names',
  url: '/docs/names',
  description:
    "Represents request to have a player's name changed. This must be approved or denied before all data is transfered over to the new name.",
  entities,
  endpoints
};
