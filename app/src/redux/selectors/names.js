import { createSelector } from 'reselect';

const rootSelector = state => state.names;
const namesSelector = state => state.names.nameChanges;

export const getError = createSelector(rootSelector, root => root.error);
export const isFetchingAll = createSelector(rootSelector, root => root.isFetchingAll);

export const getNameChangesMap = createSelector(namesSelector, map => map);

export const getNameChanges = createSelector(namesSelector, map => {
  return Object.values(map);
});

export const getNameChange = (state, id) => getNameChangesMap(state)[id];
