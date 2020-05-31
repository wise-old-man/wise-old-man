import entities from './entities';
import endpoints from './endpoints';

export default {
  title: 'Deltas',
  url: '/docs/deltas',
  description:
    "A delta represents the difference between snapshots of a specific player. This can be used\
    to calculate the player's gained experience/score/kills in any metric and/or time period,\
    check a player's progress in a competition and generate records for the player\
    (if new delta is higher than record, update record).\
    \n\n\
    Unlike the other modules, deltas are a by-product of other models and therefore has no model/table of its own.",
  entities,
  endpoints
};
