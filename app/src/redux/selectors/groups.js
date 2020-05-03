import _ from 'lodash';
import { createSelector } from 'reselect';

const rootSelector = state => state.groups;
const groupsSelector = state => state.groups.groups;
const playerGroupsSelector = state => state.groups.playerGroups;

export const isFetchingAll = createSelector(rootSelector, root => root.isFetchingAll);
export const isFetchingDetails = createSelector(rootSelector, root => root.isFetchingDetails);
export const isFetchingMembers = createSelector(rootSelector, root => root.isFetchingMembers);
export const isFetchingMonthlyTop = createSelector(rootSelector, root => root.isFetchingMonthlyTop);

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

  if (members && members.length > 0) {
    const rankedMembers = members.map((p, i) => ({ ...p, rank: i + 1 }));
    const totalExperience = members.map(m => m.overallExperience).reduce((acc, cur) => acc + cur, 0);
    return { ...group, members: rankedMembers, totalExperience };
  }

  return { ...group, members: [], totalExperience: 0 };
}
