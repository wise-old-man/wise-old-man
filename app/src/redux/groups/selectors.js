import { mapValues } from 'lodash';
import { createSelector } from 'reselect';

const rootSelector = state => state.groups;
const groupsSelector = state => state.groups.groups;
const playerGroupsSelector = state => state.groups.playerGroups;

export const getError = createSelector(rootSelector, root => root.error);
export const isFetchingList = createSelector(rootSelector, root => root.isFetchingList);
export const isFetchingDetails = createSelector(rootSelector, root => root.isFetchingDetails);
export const isFetchingMonthlyTop = createSelector(rootSelector, root => root.isFetchingMonthlyTop);
export const isFetchingStatistics = createSelector(rootSelector, root => root.isFetchingStatistics);
export const isCreating = createSelector(rootSelector, root => root.isCreating);
export const isEditing = createSelector(rootSelector, root => root.isEditing);

const getGroupsMap = createSelector(groupsSelector, map => {
  return mapValues(map, formatGroup);
});

const getPlayerGroupsMap = createSelector(playerGroupsSelector, map => {
  return mapValues(map, group => group.map(formatGroup));
});

export const getGroups = createSelector(groupsSelector, map => {
  return Object.values(map)
    .map(formatGroup)
    .sort((a, b) => b.score - a.score || a.id - b.id);
});

export function getGroup(groupId) {
  return state => getGroupsMap(state)[groupId];
}

export function getPlayerGroups(username) {
  return state => getPlayerGroupsMap(state)[username];
}

function formatGroup(group) {
  if (!group) {
    return null;
  }

  const { memberships } = group;

  if (memberships && memberships.length > 0) {
    const totalExperience = memberships.map(m => m.player.exp).reduce((acc, cur) => acc + cur, 0);
    const totalEHP = memberships.map(m => m.player.ehp).reduce((acc, cur) => acc + cur, 0);

    return { ...group, totalExperience, totalEHP };
  }

  return group;
}
