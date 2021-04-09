import { createSelector } from 'reselect';

const rootSelector = state => state.names;
const namesSelector = state => state.names.nameChanges;
const playerNamesSelector = state => state.names.playerNameChanges;
const groupNamesSelector = state => state.names.groupNameChanges;

export const getError = createSelector(rootSelector, root => root.error);
export const isFetching = createSelector(rootSelector, root => root.isFetching);
export const isSubmitting = createSelector(rootSelector, root => root.isSubmitting);

export const isFetchingGroupNameChanges = createSelector(
  rootSelector,
  root => root.isFetchingGroupNameChanges
);

export const isFetchingPlayerNameChanges = createSelector(
  rootSelector,
  root => root.isFetchingPlayerNameChanges
);

export const getNameChanges = createSelector(namesSelector, map => {
  return Object.values(map).sort((a, b) => b.createdAt - a.createdAt);
});

const getPlayerNamesMap = createSelector(playerNamesSelector, map => map);
const getGroupNameChangesMap = createSelector(groupNamesSelector, map => map);

export const getPlayerNames = (state, username) => getPlayerNamesMap(state)[username];
export const getGroupNameChanges = (state, groupId) => getGroupNameChangesMap(state)[groupId];
