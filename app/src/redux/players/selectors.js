import { createSelector } from 'reselect';

const rootSelector = state => state.players;
const playersSelector = state => state.players.players;
const updatingSelector = state => state.players.updating;
const searchResultsSelector = state => state.players.searchResults;

export const isTracking = createSelector(rootSelector, root => root.isTracking);
export const isFetching = createSelector(rootSelector, root => root.isFetching);
export const getUpdatingUsernames = createSelector(updatingSelector, updating => updating);
export const getSearchResults = createSelector(searchResultsSelector, map => Object.values(map));
export const getPlayer = (state, username) => getPlayersMap(state)[username];

const getPlayersMap = createSelector(playersSelector, map => map);
