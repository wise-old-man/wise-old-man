import { createSelector } from 'reselect';

const rootSelector = state => state.names;
const namesSelector = state => state.names.nameChanges;
const playerNamesSelector = state => state.names.playerNameChanges;

export const getError = createSelector(rootSelector, root => root.error);
export const isFetching = createSelector(rootSelector, root => root.isFetching);
export const isSubmitting = createSelector(rootSelector, root => root.isSubmitting);

export const getNameChanges = createSelector(namesSelector, map => {
  return Object.values(map).sort((a, b) => b.createdAt - a.createdAt);
});

const getPlayerNamesMap = createSelector(playerNamesSelector, map => map);

export const getPlayerNames = (state, username) => getPlayerNamesMap(state)[username];
