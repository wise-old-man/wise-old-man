import { createSelector } from 'reselect';
import { mapValues } from 'lodash';
import { ALL_METRICS } from 'config';

const rootSelector = state => state.achievements;
const playerAchievementsSelector = state => state.achievements.playerAchievements;
const groupAchievementsSelector = state => state.achievements.groupAchievements;

const getPlayerAchievementsMap = createSelector(playerAchievementsSelector, map => {
  return mapValues(map, p => p.map(formatAchievement));
});

const getGroupAchievementsMap = createSelector(groupAchievementsSelector, map => {
  return mapValues(map, p => p.map(formatAchievement));
});

export const isFetchingGroupAchievements = createSelector(
  rootSelector,
  root => root.isFetchingGroupAchievements
);

export const getGroupAchievements = (state, groupId) => getGroupAchievementsMap(state)[groupId];

export const getPlayerAchievements = (state, username, includeMissing = false) => {
  const achievements = getPlayerAchievementsMap(state)[username];

  if (!achievements || achievements.length === 0 || includeMissing) {
    return achievements;
  }

  return achievements.filter(a => !!a.createdAt);
};

export const getPlayerAchievementsGrouped = (state, username) => {
  const achievements = getPlayerAchievementsMap(state)[username];

  if (!achievements) {
    return [];
  }

  const groups = [];

  achievements.forEach(a => {
    let group = groups.find(g => g.measure === a.measure && g.metric === a.metric);

    if (!group) {
      group = { metric: a.metric, measure: a.measure, achievements: [] };
      groups.push(group);
    }

    group.achievements.push(a);
  });

  return groups.sort((a, b) => ALL_METRICS.indexOf(a.metric) - ALL_METRICS.indexOf(b.metric));
};

function formatAchievement(a) {
  const isDateUnknown = a.createdAt && a.createdAt.getFullYear() < 2000;
  return { ...a, unknownDate: !!isDateUnknown };
}
