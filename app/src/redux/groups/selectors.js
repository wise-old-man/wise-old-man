import { mapValues } from 'lodash';
import { createSelector } from 'reselect';

const rootSelector = state => state.groups;
const groupsSelector = state => state.groups.groups;
const playerGroupsSelector = state => state.groups.playerGroups;

export const getError = createSelector(rootSelector, root => root.error);
export const isFetchingAll = createSelector(rootSelector, root => root.isFetchingAll);
export const isFetchingDetails = createSelector(rootSelector, root => root.isFetchingDetails);
export const isFetchingMembers = createSelector(rootSelector, root => root.isFetchingMembers);
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

export const getGroup = (state, id) => getGroupsMap(state)[id];

export const getPlayerGroups = (state, username) => getPlayerGroupsMap(state)[username];

function formatGroup(group) {
  if (!group) {
    return null;
  }

  const { members } = group;

  if (members && members.length > 0) {
    const totalExperience = members.map(m => m.exp).reduce((acc, cur) => acc + cur, 0);
    const totalEHP = members.map(m => m.ehp).reduce((acc, cur) => acc + cur, 0);

    return { ...group, members, totalExperience, totalEHP };
  }

  return { ...group, members: [], totalExperience: 0 };
}
