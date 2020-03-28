import { createSelector } from 'reselect';

const playerSelector = state => state.players;

export const updatingList = createSelector(playerSelector, players => players.updating);

export const getUpdatingUsernames = createSelector(playerSelector, ({ updating }) => {
  return updating;
});

export const getPlayersMap = createSelector(playerSelector, ({ players }) => {
  return players;
});

export const getPlayers = createSelector(playerSelector, ({ players }) => {
  return Object.values(players);
});

export const getPlayer = (state, id) => {
  return getPlayersMap(state)[id];
};

export const getSearchResults = createSelector(playerSelector, ({ searchResults }) => {
  return Object.values(searchResults);
});
