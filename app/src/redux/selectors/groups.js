import { createSelector } from 'reselect';

const rootSelector = state => state.groups;
const groupsSelector = state => state.groups.groups;

export const isFetchingAll = createSelector(rootSelector, root => root.isFetchingAll);

export const getGroupsMap = createSelector(groupsSelector, map => {
  return map;
});

export const getGroups = createSelector(groupsSelector, map => {
  return Object.values(map);
});

export const getGroup = (state, id) => getGroupsMap(state)[id];
