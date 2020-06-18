import entities from './entities';

export default {
  title: 'Achievements',
  url: '/docs/achievements',
  description:
    'A achievement represents a milestone in the player\'s progression.\
    \n\n When a player is updated (and a snapshot is created), the new snapshot\
    is compared to the previous to check if the player achieved anything new.\
    \n\nExample: the attack level was previously 98, but is now 99, so the player\
    just achieved the "99 attack" achievement.',
  entities,
  endpoints: []
};
