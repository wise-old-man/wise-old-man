import _ from 'lodash';
import { createSelector } from 'reselect';

const rootSelector = state => state.groups;
const groupsSelector = state => state.groups.groups;
const playerGroupsSelector = state => state.groups.playerGroups;

export const isFetchingAll = createSelector(rootSelector, root => root.isFetchingAll);
export const isFetchingDetails = createSelector(rootSelector, root => root.isFetchingDetails);

export const getGroupsMap = createSelector(groupsSelector, map => {
  return _.mapValues(map, group => formatGroup(group));
});

export const getPlayerGroupsMap = createSelector(playerGroupsSelector, map => {
  return _.mapValues(map, group => group.map(g => formatGroup(g)));
});

export const getGroups = createSelector(groupsSelector, map => {
  return Object.values(map).map(g => formatGroup(g));
});

export const getGroup = (state, id) => getGroupsMap(state)[id];

export const getPlayerGroups = (state, playerId) => getPlayerGroupsMap(state)[playerId];

function formatGroup(group) {
  if (!group) {
    return null;
  }

  const { members } = group;

  return { ...group, members: members ? members.map((p, i) => ({ ...p, rank: i + 1 })) : [] };
}
